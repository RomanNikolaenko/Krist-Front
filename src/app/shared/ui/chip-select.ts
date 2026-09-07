import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface ChipOption {
  /** What goes back to the server. */
  readonly value: string;
  readonly label: string;
  /** A colour to show beside the label, for the ones that have one. */
  readonly swatch?: string | null;
}

/**
 * Pick any number of things from a short, visible list.
 *
 * A native `<select multiple>` is the wrong control here: it hides how many
 * options there are, needs a modifier key nobody discovers, and cannot show a
 * colour beside a name. Chips show the whole set at once and say which are on
 * by looking different, not by being scrolled to.
 *
 * The selection lives with the caller. This renders it and reports taps.
 */
@Component({
  selector: 'app-chip-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './chip-select.scss',
  templateUrl: './chip-select.html',
})
export class ChipSelect {
  readonly label = input('');
  readonly options = input.required<readonly ChipOption[]>();
  readonly selected = input.required<readonly string[]>();
  /** Shown in place of the chips when there is nothing to choose from. */
  readonly emptyText = input('');

  readonly toggled = output<string>();

  private readonly chosen = computed(() => new Set(this.selected()));

  protected isOn(value: string): boolean {
    return this.chosen().has(value);
  }
}
