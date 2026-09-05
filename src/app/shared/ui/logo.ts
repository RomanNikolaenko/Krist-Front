import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Krist wordmark. The mark is a geometric stand-in for the kit's logo —
 * drop in the real SVG export to make it exact.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--c-heading); }
    :host(.light) { color: var(--c-footer-fg); }
    .mark { width: var(--logo-mark, 2.125rem); height: var(--logo-mark, 2.125rem); flex: none; }
    .word {
      /* a host can set --logo-word: none to keep just the mark */
      display: var(--logo-word, inline);
      font-size: var(--logo-size, 2.125rem);
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1;
    }
  `,
  template: `
    <svg class="mark" viewBox="0 0 34 34" fill="currentColor" aria-hidden="true">
      <path d="M0 0h10L0 12Z" />
      <path d="M0 22l10 12H0Z" />
      <path d="M12 0h9L8 17l13 17h-9L2 17Z" />
    </svg>
    <span class="word">{{ label() }}</span>
  `,
})
export class Logo {
  readonly label = input('Krist');
}
