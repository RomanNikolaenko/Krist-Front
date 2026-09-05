import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

/**
 * Centered overlay dialog used by "Add a new address" and the order-confirmed
 * screen. Closes on Escape and on backdrop click; locks page scroll while open.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './modal.scss',
  templateUrl: './modal.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class Modal {
  readonly open = input(false);
  readonly label = input('Dialog');
  readonly width = input(490);
  readonly closed = output<void>();

  constructor() {
    effect(() => {
      document.body.classList.toggle('is-locked', this.open());
    });
  }

  protected onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop')) this.closed.emit();
  }
}
