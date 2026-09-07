import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LANGUAGES } from '../../core/i18n/i18n';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { T } from '../../shared/t.pipe';

/** The language a taxonomy row is written in; the rest are translations. */
const BASE_LOCALE = 'en';

export interface TaxonomyRow {
  readonly id: string;
  readonly name: string;
  /** Present only for colours. */
  readonly hex?: string;
  /** How many products use it — what makes a delete refusable. */
  readonly count: number;
  /**
   * 1 for something inside a department, 0 otherwise.
   *
   * A flag rather than a prefix baked into the name: the row is also what the
   * rename form starts from, and a decorated name saved straight back is how a
   * category ended up called "— — T-Shirts".
   */
  readonly depth?: number;
  /** Names in other languages, keyed by locale. */
  readonly translations?: Readonly<Record<string, string>>;
  /** Set on a department so its children can be folded away under it. */
  readonly children?: readonly TaxonomyRow[];
}

export interface TaxonomyEdit {
  readonly id: string;
  readonly name: string;
  readonly hex: string;
  /** Set only when the list offers parents and one was picked. */
  readonly parentId?: string;
  /** Every language other than the base one; blank means "no translation". */
  readonly translations: { locale: string; name: string }[];
}

/**
 * One editable list of taxonomy rows: colours, sizes or categories.
 *
 * The three were the same eighty lines of markup written out three times, and
 * the only difference between them is whether a row carries a colour. That is
 * the `withColor` input; everything else is identical.
 *
 * Which row is being renamed is kept here rather than passed in. It is state
 * about this widget and nothing outside it can act on the answer — the screen
 * only ever hears about the three things that change the server.
 */
@Component({
  selector: 'app-taxonomy-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, FormsModule, Icon, Modal, T],
  styleUrl: './taxonomy-list.scss',
  templateUrl: './taxonomy-list.html',
})
export class TaxonomyList {
  readonly heading = input.required<string>();
  readonly rows = input.required<readonly TaxonomyRow[]>();
  readonly withColor = input(false);
  readonly addPlaceholder = input('');

  /**
   * Whether a row's name is worth translating.
   *
   * Sizes are S, M and L — the same in every language — so they are spared the
   * extra fields rather than given empty ones nobody will ever fill.
   */
  readonly translatable = input(false);

  /**
   * Departments a new row may be filed under. Empty means this list has no
   * nesting, and the parent picker is not drawn at all.
   */
  readonly parents = input<readonly TaxonomyRow[]>([]);

  readonly added = output<TaxonomyEdit>();
  readonly renamed = output<TaxonomyEdit>();
  readonly removed = output<string>();

  /** The languages other than the base one, in the order the shop offers them. */
  protected readonly otherLanguages = LANGUAGES.filter((l) => l.code !== BASE_LOCALE);

  /**
   * Which departments are open.
   *
   * Shut to start with: nine departments holding five entries each is a
   * screen where the thing you came for is somewhere in fifty rows. The one
   * exception is a department you have just added to — see `add()`.
   */
  private readonly opened = signal<Record<string, boolean>>({});

  protected isOpen(id: string): boolean {
    return this.opened()[id] ?? false;
  }

  protected toggleOpen(id: string): void {
    this.opened.update((all) => ({ ...all, [id]: !this.isOpen(id) }));
  }

  protected readonly editingId = signal<string | null>(null);
  protected readonly draftName = signal('');
  protected readonly draftHex = signal('#000000');
  protected readonly draftNames = signal<Record<string, string>>({});

  /** The row a confirmation dialog is open for, if any. */
  protected readonly confirming = signal<TaxonomyRow | null>(null);

  protected newName = '';
  protected newHex = '#4a4ae4';
  /** Empty string means "a department of its own". */
  protected newParentId = '';
  protected readonly newNames = signal<Record<string, string>>({});

  protected startEdit(row: TaxonomyRow): void {
    this.editingId.set(row.id);
    this.draftName.set(row.name);
    this.draftHex.set(row.hex ?? '#000000');
    this.draftNames.set({ ...(row.translations ?? {}) });
  }

  protected nameFor(names: Record<string, string>, locale: string): string {
    return names[locale] ?? '';
  }

  protected setDraftName(locale: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draftNames.update((all) => ({ ...all, [locale]: value }));
  }

  protected setNewName(locale: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newNames.update((all) => ({ ...all, [locale]: value }));
  }

  protected saveEdit(): void {
    const id = this.editingId();
    const name = this.draftName().trim();
    if (!id || !name) return;

    this.renamed.emit({
      id,
      name,
      hex: this.draftHex(),
      translations: this.asList(this.draftNames()),
    });
    this.editingId.set(null);
  }

  protected add(): void {
    const name = this.newName.trim();
    if (!name) return;

    const parentId = this.newParentId || undefined;

    this.added.emit({
      id: '',
      name,
      hex: this.newHex,
      parentId,
      translations: this.asList(this.newNames()),
    });

    /*
     * Open the department it went into.
     *
     * The list re-reads from the server after a write, and with everything
     * shut by default a new subcategory would land inside a folded row — the
     * screen would look exactly as it did before, which reads as nothing
     * having happened.
     */
    if (parentId) this.opened.update((all) => ({ ...all, [parentId]: true }));

    this.newName = '';
    this.newNames.set({});
  }

  /**
   * Deleting is refused by the server while anything still uses it, but a row
   * with nothing in it goes without argument — and a delete button sitting
   * beside an edit button is one slip away from being pressed by mistake.
   */
  protected confirmRemove(): void {
    const row = this.confirming();
    if (!row) return;

    this.removed.emit(row.id);
    this.confirming.set(null);
  }

  /**
   * Every non-base language is sent, blanks included: a cleared field is a
   * translation being withdrawn, and leaving it out would read as "unchanged".
   */
  private asList(names: Record<string, string>): { locale: string; name: string }[] {
    if (!this.translatable()) return [];

    return this.otherLanguages.map((language) => ({
      locale: language.code,
      name: names[language.code] ?? '',
    }));
  }
}
