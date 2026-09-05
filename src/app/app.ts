import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18n } from './core/i18n/i18n';
import { ThemeStore } from './core/theme-store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  // Keying the outlet on the language rebuilds the view tree when it changes,
  // which is what lets the translate pipe stay pure.
  template: `
    @for (lang of [i18n.lang()]; track lang) {
      <router-outlet />
    }
  `,
})
export class App {
  protected readonly i18n = inject(I18n);
  /** Injected for its side effect: applying the stored theme to <html>. */
  protected readonly theme = inject(ThemeStore);

  constructor() {
    // Keep <html lang> honest for screen readers and hyphenation.
    effect(() => document.documentElement.setAttribute('lang', this.i18n.lang()));
  }
}
