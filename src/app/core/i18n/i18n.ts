import { computed, Injectable } from '@angular/core';
import { persistentSignal } from '../storage';
import { en, TranslationKey } from './en';
import { uk } from './uk';

export type LanguageCode = 'en' | 'uk';

export interface Language {
  code: LanguageCode;
  label: string;
}

/** Only locales with a complete dictionary are offered. */
export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
];

const DICTIONARIES: Record<LanguageCode, Record<TranslationKey, string>> = { en, uk };

export type TranslationParams = Record<string, string | number>;

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly state = persistentSignal<LanguageCode>('krist.language', detect());

  readonly lang = this.state.asReadonly();
  readonly languages = LANGUAGES;

  private readonly dict = computed(() => DICTIONARIES[this.state()] ?? en);

  readonly label = computed(
    () => LANGUAGES.find((l) => l.code === this.state())?.label ?? 'English',
  );

  use(code: LanguageCode): void {
    if (code in DICTIONARIES) this.state.set(code);
  }

  /**
   * Looks a key up in the active dictionary. `{placeholders}` in the string are
   * replaced from `params`. An unknown key returns itself, which makes a missing
   * translation loud in the UI instead of silently blank.
   */
  translate(key: TranslationKey | string, params?: TranslationParams): string {
    const table = this.dict() as Record<string, string>;
    const template = table[key];
    if (template === undefined) return key;
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }
}

/**
 * First visit follows the browser, then the user's choice sticks.
 *
 * The whole preference list is walked, not just the first entry: a browser set
 * to Polish first and Ukrainian second should get Ukrainian rather than falling
 * straight through to English. Regions are dropped — `uk-UA` is Ukrainian — and
 * anything the shop has no dictionary for is skipped, so a language we cannot
 * actually render never wins.
 */
function detect(): LanguageCode {
  const known = new Set<string>(LANGUAGES.map((language) => language.code));

  const preferences = globalThis.navigator?.languages?.length
    ? globalThis.navigator.languages
    : [globalThis.navigator?.language ?? ''];

  for (const preference of preferences) {
    const code = preference.toLowerCase().split('-')[0];
    if (known.has(code)) return code as LanguageCode;
  }

  return 'en';
}
