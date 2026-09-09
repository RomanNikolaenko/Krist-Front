import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdminApi, AdminCategory, AdminColor, AdminSize } from '../../core/admin.api';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';
import { apiMessage } from '../../core/api-error';
import { TaxonomyEdit, TaxonomyList, TaxonomyRow } from './taxonomy-list';

type Kind = 'color' | 'size' | 'category';

/** Translations as the list component wants them: keyed by locale. */
const namesByLocale = (translations: { locale: string; name: string }[]) =>
  Object.fromEntries(translations.map((entry) => [entry.locale, entry.name]));

@Component({
  selector: 'app-admin-taxonomy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaxonomyList, T],
  templateUrl: './taxonomy.html',
  styleUrl: './taxonomy.scss',
})
export class AdminTaxonomy {
  private readonly api = inject(AdminApi);
  private readonly i18n = inject(I18n);

  protected readonly colors = signal<AdminColor[]>([]);
  protected readonly sizes = signal<AdminSize[]>([]);
  protected readonly categories = signal<AdminCategory[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal('');

  /** The three tables in the one shape the list component renders. */
  protected readonly colorRows = computed<TaxonomyRow[]>(() =>
    this.colors().map((row) => ({
      id: row.id,
      name: row.label,
      hex: row.hex,
      count: row._count.products,
      translations: namesByLocale(row.translations),
    })),
  );
  protected readonly sizeRows = computed<TaxonomyRow[]>(() =>
    this.sizes().map((row) => ({ id: row.id, name: row.name, count: row._count.products })),
  );
  /**
   * Departments, each carrying its own children rather than the whole tree
   * flattened into one list — that is what lets the list fold them away.
   */
  protected readonly categoryRows = computed<TaxonomyRow[]>(() => {
    const all = this.categories();

    return all
      .filter((row) => row.parentId === null)
      .map((parent) => ({
        id: parent.id,
        name: parent.label,
        count: parent._count.products,
        translations: namesByLocale(parent.translations),
        children: all
          .filter((row) => row.parentId === parent.id)
          .map((child) => ({
            id: child.id,
            name: child.label,
            depth: 1,
            count: child._count.products,
            translations: namesByLocale(child.translations),
          })),
      }));
  });
  /** What a new category may be filed under. */
  protected readonly departmentRows = computed<TaxonomyRow[]>(() =>
    this.categories()
      .filter((row) => row.parentId === null)
      .map((row) => ({ id: row.id, name: row.label, count: row._count.products })),
  );

  constructor() {
    void this.load();
  }

  protected addColor(edit: TaxonomyEdit): void {
    void this.run(() =>
      this.api.createColor({ name: edit.name, hex: edit.hex, translations: edit.translations }),
    );
  }

  protected addSize(edit: TaxonomyEdit): void {
    void this.run(() => this.api.createSize({ name: edit.name }));
  }

  protected addCategory(edit: TaxonomyEdit): void {
    void this.run(() =>
      this.api.createCategory({
        name: edit.name,
        parentId: edit.parentId,
        translations: edit.translations,
      }),
    );
  }

  protected renameColor(edit: TaxonomyEdit): void {
    void this.run(() =>
      this.api.updateColor(edit.id, {
        name: edit.name,
        hex: edit.hex,
        translations: edit.translations,
      }),
    );
  }

  protected renameSize(edit: TaxonomyEdit): void {
    void this.run(() => this.api.updateSize(edit.id, { name: edit.name }));
  }

  protected renameCategory(edit: TaxonomyEdit): void {
    void this.run(() =>
      this.api.updateCategory(edit.id, { name: edit.name, translations: edit.translations }),
    );
  }

  /**
   * Deleting is refused by the server while anything still uses it, and that
   * refusal is what the screen shows — there is no confirmation dialog because
   * the only deletions that go through are the ones that change nothing else.
   */
  protected remove(kind: Kind, id: string): void {
    void this.run(() => {
      if (kind === 'color') return this.api.deleteColor(id);
      if (kind === 'size') return this.api.deleteSize(id);
      return this.api.deleteCategory(id);
    });
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.error.set('');
    try {
      await action();
      await this.load();
    } catch (error) {
      this.error.set(apiMessage(error, this.i18n.translate('admin.saveFailed')));
    }
  }

  private async load(): Promise<void> {
    try {
      const [colors, sizes, categories] = await Promise.all([
        this.api.colors(),
        this.api.sizes(),
        this.api.categories(),
      ]);

      this.colors.set(colors);
      this.sizes.set(sizes);
      this.categories.set(categories);
    } catch (error) {
      this.error.set(apiMessage(error, this.i18n.translate('admin.saveFailed')));
    } finally {
      this.loading.set(false);
    }
  }
}
