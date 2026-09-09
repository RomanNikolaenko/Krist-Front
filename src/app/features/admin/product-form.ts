import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AdminApi, AdminCategory, AdminColor, AdminSize, ProductDraft } from '../../core/admin.api';
import { I18n } from '../../core/i18n/i18n';
import { ChipOption, ChipSelect } from '../../shared/ui/chip-select';
import { LANGUAGES } from '../../core/i18n/i18n';
import { Icon } from '../../shared/ui/icon';
import { apiMessage } from '../../core/api-error';
import { T } from '../../shared/t.pipe';

interface TranslationDraft {
  name: string;
  description: string;
}

/**
 * The language a product is written in. Its text lives in the product's own
 * fields; every other language is a translation that falls back to it.
 */
const BASE_LOCALE = 'en';

const blank = (): TranslationDraft => ({ name: '', description: '' });

@Component({
  selector: 'app-admin-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ChipSelect, Icon, T],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class AdminProductForm {
  private readonly api = inject(AdminApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  /** "new" is not an id; it is the word the route uses for a blank form. */
  private readonly routeId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? 'new')),
    { initialValue: 'new' },
  );

  protected readonly editing = computed(() => this.routeId() !== 'new');

  protected readonly categories = signal<AdminCategory[]>([]);
  protected readonly colors = signal<AdminColor[]>([]);
  protected readonly sizes = signal<AdminSize[]>([]);

  /** The three multi-selects. Each holds names; the server resolves them. */
  /** The tab bar over the name and description. */
  protected readonly languages = LANGUAGES;
  protected readonly baseLocale = BASE_LOCALE;
  protected readonly editingLocale = signal<string>(BASE_LOCALE);

  /** Keyed by locale, base language excluded — that one is in the form. */
  protected readonly translations = signal<Record<string, TranslationDraft>>({});

  protected readonly chosenCategories = signal<string[]>([]);
  protected readonly chosenSubcategories = signal<string[]>([]);
  protected readonly chosenColors = signal<string[]>([]);
  protected readonly chosenSizes = signal<string[]>([]);

  /**
   * Departments to choose from, and then whatever sits inside the ones
   * chosen. The second list is empty until the first has an answer, which is
   * what makes this two steps rather than one long list of everything.
   */
  private readonly departments = computed(() =>
    this.categories().filter((row) => row.parentId === null),
  );

  protected readonly categoryOptions = computed<ChipOption[]>(() =>
    this.departments().map((row) => ({ value: row.key, label: row.label })),
  );

  protected readonly subcategoryOptions = computed<ChipOption[]>(() => {
    const chosen = new Set(this.chosenCategories());
    const parents = this.departments().filter((row) => chosen.has(row.key));
    const nameById = new Map(parents.map((row) => [row.id, row.label]));

    /*
     * Men and Women both sell shoes, so with more than one department in play
     * a bare "Shoes" names two different chips. The department is added only
     * when it is the thing telling them apart.
     */
    const qualify = parents.length > 1;

    return this.categories()
      .filter((row) => row.parentId !== null && nameById.has(row.parentId))
      .map((row) => ({
        value: row.key,
        label: qualify ? `${nameById.get(row.parentId ?? '')} · ${row.label}` : row.label,
      }));
  });
  protected readonly colorOptions = computed<ChipOption[]>(() =>
    this.colors().map((row) => ({ value: row.name, label: row.label, swatch: row.hex })),
  );
  protected readonly sizeOptions = computed<ChipOption[]>(() =>
    this.sizes().map((row) => ({ value: row.name, label: row.name })),
  );

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    brand: ['', [Validators.required, Validators.maxLength(120)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(5000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    oldPrice: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    images: this.fb.array<string>([]),
  });

  protected get images(): FormArray {
    return this.form.controls.images;
  }

  constructor() {
    void this.load();
  }

  /** The draft for a locale, created on first sight so the inputs have a value. */
  protected translationOf(locale: string): TranslationDraft {
    return this.translations()[locale] ?? blank();
  }

  protected setTranslation(locale: string, field: keyof TranslationDraft, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;

    this.translations.update((all) => ({
      ...all,
      [locale]: { ...(all[locale] ?? blank()), [field]: value },
    }));
  }

  /** Marks the tab of a language that has something written in it. */
  protected hasTranslation(locale: string): boolean {
    const draft = this.translations()[locale];

    return Boolean(draft?.name.trim() || draft?.description.trim());
  }
  /**
   * Dropping a department drops what was chosen inside it.
   *
   * Otherwise the subcategory stays selected while its own list stops showing
   * it, and the product saves into a department the form says it is not in.
   */
  protected toggleDepartment(key: string): void {
    this.toggle(this.chosenCategories, key);

    const offered = new Set(this.subcategoryOptions().map((option) => option.value));
    this.chosenSubcategories.update((list) => list.filter((value) => offered.has(value)));
  }

  /** One handler for all three chip groups: they differ only in the list. */
  protected toggle(chosen: WritableSignal<string[]>, name: string): void {
    chosen.update((list) =>
      list.includes(name) ? list.filter((value) => value !== name) : [...list, name],
    );
  }

  protected addImage(): void {
    this.images.push(this.fb.nonNullable.control('', Validators.required));
  }

  protected removeImage(index: number): void {
    this.images.removeAt(index);
  }

  /**
   * Saves, and says what the server said when it refuses.
   *
   * The rules the API enforces — a discount that is not one, an unknown
   * colour — are not restated here: duplicating them would give two places to
   * keep in step, and the message that comes back already names the field.
   */
  protected async save(): Promise<void> {
    if (this.saving()) return;
    this.error.set('');

    const images = (this.images.value as string[])
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (
      this.form.invalid ||
      !this.chosenCategories().length ||
      !this.chosenColors().length ||
      !this.chosenSizes().length
    ) {
      this.form.markAllAsTouched();
      this.error.set(this.i18n.translate('admin.formIncomplete'));
      return;
    }
    if (!images.length) {
      this.error.set(this.i18n.translate('admin.needsImage'));
      return;
    }

    const value = this.form.getRawValue();
    const draft: ProductDraft = {
      brand: value.brand.trim(),
      name: value.name.trim(),
      description: value.description.trim(),
      price: Number(value.price),
      oldPrice: value.oldPrice === null || value.oldPrice === 0 ? null : Number(value.oldPrice),
      // Both levels travel together; the server adds any department a
      // subcategory implies but the form did not send.
      categories: [...this.chosenCategories(), ...this.chosenSubcategories()],
      colors: this.chosenColors(),
      sizes: this.chosenSizes(),
      stock: value.stock,
      images: images.map((url) => ({ url })),
      translations: Object.entries(this.translations()).map(([locale, text]) => ({
        locale,
        ...text,
      })),
    };

    this.saving.set(true);
    try {
      const id = this.routeId();
      if (this.editing()) await this.api.updateProduct(id, draft);
      else await this.api.createProduct(draft);

      await this.router.navigate(['/admin/products']);
    } catch (error) {
      this.error.set(apiMessage(error, this.i18n.translate('admin.saveFailed')));
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    try {
      const [categories, colors, sizes] = await Promise.all([
        this.api.categories(),
        this.api.colors(),
        this.api.sizes(),
      ]);

      this.categories.set(categories);
      this.colors.set(colors);
      this.sizes.set(sizes);

      if (!this.editing()) {
        this.addImage();
        // A blank form still has to name a department, so it starts on the first.
        const first = this.departments()[0];
        this.chosenCategories.set(first ? [first.key] : []);
        return;
      }

      const product = await this.api.product(this.routeId());
      this.form.patchValue({
        brand: product.brand,
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        stock: product.stock,
      });
      // Nulls become empty strings: the inputs need a value, and an empty one
      // is what the server reads back as "no translation".
      this.translations.set(
        Object.fromEntries(
          product.translations.map((text) => [
            text.locale,
            { name: text.name ?? '', description: text.description ?? '' },
          ]),
        ),
      );
      // The product names both levels; each chip group takes its own.
      this.chosenCategories.set(
        product.categories.filter((c) => c.parentKey === null).map((c) => c.key),
      );
      this.chosenSubcategories.set(
        product.categories.filter((c) => c.parentKey !== null).map((c) => c.key),
      );
      this.chosenColors.set(product.colors.map((color) => color.name));
      this.chosenSizes.set(product.sizes);

      this.images.clear();
      for (const url of product.images) {
        this.images.push(this.fb.nonNullable.control(url, Validators.required));
      }
    } catch (error) {
      this.error.set(apiMessage(error, this.i18n.translate('admin.saveFailed')));
    } finally {
      this.loading.set(false);
    }
  }
}
