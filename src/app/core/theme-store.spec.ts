import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeStore } from './theme-store';

/** Pretend the OS is in dark (or light) mode for the duration of a test. */
function stubPrefersDark(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeEventListener: () => {},
  }));

  return {
    flipTo(dark: boolean) {
      listeners.forEach((fn) => fn({ matches: dark } as MediaQueryListEvent));
    },
  };
}

function open(): ThemeStore {
  TestBed.resetTestingModule();
  const store = TestBed.inject(ThemeStore);
  TestBed.tick(); // let the effect stamp <html>
  return store;
}

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => vi.unstubAllGlobals());

  it('defaults to System and stamps no attribute', () => {
    stubPrefersDark(false);
    const store = open();

    expect(store.appearance()).toBe('System');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('resolves System from the OS preference', () => {
    stubPrefersDark(true);
    expect(open().resolved()).toBe('dark');
  });

  it('follows the OS while it stays on System', () => {
    const os = stubPrefersDark(false);
    const store = open();
    expect(store.resolved()).toBe('light');

    os.flipTo(true);
    expect(store.resolved()).toBe('dark');
  });

  it('stamps an explicit choice on <html> and stops following the OS', () => {
    const os = stubPrefersDark(true);
    const store = open();

    store.set('Light');
    TestBed.tick();

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(store.resolved()).toBe('light');

    os.flipTo(false);
    expect(store.resolved()).toBe('light');
  });

  it('clears the attribute again when it goes back to System', () => {
    stubPrefersDark(false);
    const store = open();

    store.set('Dark');
    TestBed.tick();
    expect(document.documentElement.dataset['theme']).toBe('dark');

    store.set('System');
    TestBed.tick();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('remembers the choice across instances', () => {
    stubPrefersDark(false);
    open().set('Dark');
    TestBed.tick();

    expect(open().appearance()).toBe('Dark');
  });
});
