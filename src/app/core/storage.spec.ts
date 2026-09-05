import { Injectable, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { persistentSignal } from './storage';

/** persistentSignal needs an injection context, so exercise it through a service. */
function open<T>(key: string, initial: T, version = 1): WritableSignal<T> {
  @Injectable()
  class Holder {
    readonly value = persistentSignal(key, initial, version);
  }

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [Holder] });
  return TestBed.inject(Holder).value;
}

/** Effects are flushed on tick, which is when the write actually lands. */
function flush(): void {
  TestBed.tick();
}

describe('persistentSignal', () => {
  beforeEach(() => localStorage.clear());

  it('starts from the initial value when nothing is stored', () => {
    expect(open('k.a', ['x'])()).toEqual(['x']);
  });

  it('writes a versioned envelope and reads it back on the next open', () => {
    const value = open('k.b', 0);
    value.set(42);
    flush();

    expect(JSON.parse(localStorage.getItem('k.b')!)).toEqual({ v: 1, d: 42 });
    expect(open('k.b', 0)()).toBe(42);
  });

  it('discards a payload written under a different version', () => {
    localStorage.setItem('k.c', JSON.stringify({ v: 1, d: 'old shape' }));

    expect(open('k.c', 'fresh', 2)()).toBe('fresh');
  });

  it('discards legacy payloads that predate the envelope', () => {
    localStorage.setItem('k.d', JSON.stringify([{ id: 1, holder: 'Robert Fox' }]));

    expect(open<unknown[]>('k.d', [])()).toEqual([]);
  });

  it('falls back when the stored content cannot be parsed', () => {
    localStorage.setItem('k.e', '{not json');

    expect(open('k.e', 'fallback')()).toBe('fallback');
  });
});
