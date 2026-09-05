import { computed, effect, Injectable, signal } from '@angular/core';
import { persistentSignal } from './storage';

export type Appearance = 'Light' | 'Dark' | 'System';

export const APPEARANCES: Appearance[] = ['Light', 'Dark', 'System'];

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Drives the palette by stamping `data-theme` on <html>. "System" stamps
 * nothing, which leaves the `prefers-color-scheme` rule in _tokens.scss in
 * charge, so the page follows the OS live.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly state = persistentSignal<Appearance>('krist.appearance', 'System');

  /** Live view of the OS preference, so "System" stays correct if the OS flips. */
  private readonly systemDark = signal(matchesDark());

  readonly appearance = this.state.asReadonly();

  /** What is actually on screen right now, with "System" resolved. */
  readonly resolved = computed<'light' | 'dark'>(() => {
    const choice = this.state();
    if (choice === 'Light') return 'light';
    if (choice === 'Dark') return 'dark';
    return this.systemDark() ? 'dark' : 'light';
  });

  constructor() {
    globalThis
      .matchMedia?.(DARK_QUERY)
      .addEventListener('change', (event) => this.systemDark.set(event.matches));

    effect(() => {
      const choice = this.state();
      const root = document.documentElement;

      if (choice === 'System') {
        root.removeAttribute('data-theme');
      } else {
        root.dataset['theme'] = choice.toLowerCase();
      }
    });
  }

  set(appearance: Appearance): void {
    this.state.set(appearance);
  }
}

function matchesDark(): boolean {
  return globalThis.matchMedia?.(DARK_QUERY).matches ?? false;
}
