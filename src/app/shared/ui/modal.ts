import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

/**
 * Centered overlay dialog used by "Add a new address" and the order-confirmed
 * screen. Closes on Escape and on backdrop click; locks page scroll while open.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      background: var(--c-overlay);
      display: grid;
      place-items: center;
      padding: 1.5rem;
      z-index: 100;
      overflow-y: auto;
    }
    .panel {
      background: var(--c-panel);
      width: 100%;
      max-width: var(--modal-width, 30.625rem);
      padding: 2rem;
      box-shadow: var(--shadow-card);
      max-height: calc(100vh - 3rem);
      overflow-y: auto;
    }
    @media (max-width: 37.5rem) { .panel { padding: 1.375rem; } }
  `,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="onBackdrop($event)">
        <div class="panel" role="dialog" aria-modal="true" [attr.aria-label]="label()"
             [style.--modal-width.px]="width()">
          <ng-content />
        </div>
      </div>
    }
  `,
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
