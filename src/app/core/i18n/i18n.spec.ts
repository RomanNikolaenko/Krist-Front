import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18n, LANGUAGES } from './i18n';
import { en, TranslationKey } from './en';
import { uk } from './uk';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    i18n = TestBed.inject(I18n);
    i18n.use('en');
  });

  /**
   * The service reads the browser once, at construction, so each of these
   * builds a fresh one against a stubbed preference list.
   */
  describe('the first visit', () => {
    const withLanguages = (languages: string[]): I18n => {
      localStorage.clear();
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
      TestBed.resetTestingModule();

      return TestBed.inject(I18n);
    };

    afterEach(() => vi.restoreAllMocks());

    it('follows the browser when it asks for a language we have', () => {
      expect(withLanguages(['uk-UA', 'en-US']).lang()).toBe('uk');
    });

    it('ignores the region — uk-UA and uk are the same language', () => {
      expect(withLanguages(['UK']).lang()).toBe('uk');
    });

    it('walks past languages it has no dictionary for', () => {
      expect(withLanguages(['pl-PL', 'de', 'uk']).lang()).toBe('uk');
    });

    it('falls back to English when none of them is on offer', () => {
      expect(withLanguages(['ja', 'ko']).lang()).toBe('en');
    });

    it('falls back to English when the browser says nothing', () => {
      expect(withLanguages([]).lang()).toBe('en');
    });

    it('lets a stored choice win over the browser', () => {
      localStorage.setItem('krist.language', JSON.stringify({ v: 1, d: 'en' }));
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['uk']);
      TestBed.resetTestingModule();

      expect(TestBed.inject(I18n).lang()).toBe('en');
    });
  });
  it('offers exactly the locales that have a dictionary', () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'uk']);
  });

  it('translates from the active dictionary', () => {
    expect(i18n.translate('nav.home')).toBe('Home');

    i18n.use('uk');
    expect(i18n.translate('nav.home')).toBe('Головна');
  });

  it('fills placeholders', () => {
    expect(i18n.translate('shop.showing', { from: 1, to: 16, total: 48 })).toBe(
      'Showing 1–16 of 48 results',
    );

    i18n.use('uk');
    expect(i18n.translate('product.reviewCount', { count: 121 })).toBe('Відгуків: 121');
  });

  it('leaves an unknown placeholder untouched rather than blanking it', () => {
    expect(i18n.translate('shop.showing', { from: 1 })).toBe('Showing 1–{to} of {total} results');
  });

  it('returns the key itself when it is missing, so gaps are visible', () => {
    expect(i18n.translate('not.a.real.key')).toBe('not.a.real.key');
  });

  it('ignores a locale it has no dictionary for', () => {
    i18n.use('de' as never);
    expect(i18n.lang()).toBe('en');
  });

  it('remembers the choice across instances', () => {
    i18n.use('uk');
    TestBed.tick(); // the persisting effect writes on flush

    TestBed.resetTestingModule();
    expect(TestBed.inject(I18n).lang()).toBe('uk');
  });

  it('has a Ukrainian string for every English key, and none spare', () => {
    const enKeys = Object.keys(en).sort();
    const ukKeys = Object.keys(uk).sort();

    expect(ukKeys).toEqual(enKeys);
  });

  it('has no empty translations', () => {
    const blank = (Object.keys(en) as TranslationKey[]).filter(
      (k) => !en[k].trim() || !uk[k].trim(),
    );
    expect(blank).toEqual([]);
  });

  it('keeps the same placeholders in both locales', () => {
    const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();

    const mismatched = (Object.keys(en) as TranslationKey[]).filter(
      (k) => placeholders(en[k]).join() !== placeholders(uk[k]).join(),
    );

    expect(mismatched).toEqual([]);
  });
});
