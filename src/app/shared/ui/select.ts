import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from './icon';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Styled replacement for `<select>`. The native dropdown paints its option list
 * with the OS palette, which is unreadable against the dark theme, so the list
 * is rendered in-page with our own tokens.
 *
 * Works standalone via `[(value)]` and inside reactive forms via
 * `formControlName` — it implements ControlValueAccessor.
 */
@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true },
  ],
  styleUrl: './select.scss',
  templateUrl: './select.html',
  host: {
    '[class.is-disabled]': 'disabled()',
    '[class.field]': "variant() === 'field'",
    '[class.soft]': "variant() === 'soft'",
    '[class.plain]': "variant() === 'plain'",
  },
})
export class Select implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  /** `field` — bordered control, `soft` — grey pill, `plain` — bare text + caret. */
  readonly variant = input<'field' | 'soft' | 'plain'>('field');

  readonly value = model('');
  readonly disabled = signal(false);

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);
  protected readonly listId = `select-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly selected = computed(() =>
    this.options().find((o) => o.value === this.value()),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ---------- ControlValueAccessor ----------
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ---------- interaction ----------
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.close();
      this.trigger()?.nativeElement.focus();
    }
  }

  protected toggle(): void {
    this.open() ? this.close() : this.openPanel();
  }

  protected choose(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.close();
    this.trigger()?.nativeElement.focus();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    if (!count) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) {
          this.openPanel();
          return;
        }
        const step = event.key === 'ArrowDown' ? 1 : -1;
        this.activeIndex.update((i) => (i + step + count) % count);
        return;
      }
      case 'Home':
        if (this.open()) { event.preventDefault(); this.activeIndex.set(0); }
        return;
      case 'End':
        if (this.open()) { event.preventDefault(); this.activeIndex.set(count - 1); }
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.open()) this.choose(this.options()[this.activeIndex()].value);
        else this.openPanel();
        return;
      case 'Tab':
        this.close();
    }
  }

  private openPanel(): void {
    const index = this.options().findIndex((o) => o.value === this.value());
    this.activeIndex.set(index >= 0 ? index : 0);
    this.open.set(true);
  }

  private close(): void {
    this.open.set(false);
    this.onTouched();
  }
}
