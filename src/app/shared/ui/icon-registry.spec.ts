import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ICONS, IconRegistry } from './icon-registry';

describe('IconRegistry', () => {
  let registry: IconRegistry;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    registry = TestBed.inject(IconRegistry);
    http = TestBed.inject(HttpTestingController);
  });

  it('starts empty and fills in once the file arrives', () => {
    const icon = registry.get('search');
    expect(icon()).toBeNull();

    http.expectOne('svg/search.svg').flush('<svg><circle /></svg>');
    expect(icon()).not.toBeNull();
  });

  it('requests each icon once however many callers ask for it', () => {
    const first = registry.get('bag');
    const second = registry.get('bag');

    expect(second).toBe(first);
    http.expectOne('svg/bag.svg').flush('<svg />');
    http.verify(); // a second request would fail here
  });

  it('builds urls from the file override and the version', () => {
    expect(registry.url({ name: 'heart' })).toBe('svg/heart.svg');
    expect(registry.url({ name: 'heart', file: 'heart-outline' })).toBe('svg/heart-outline.svg');
    expect(registry.url({ name: 'heart', version: '2' })).toBe('svg/heart.svg?ver=2');
  });

  it('survives a missing file without throwing', () => {
    const icon = registry.get('close');
    http.expectOne('svg/close.svg').error(new ProgressEvent('404'));

    expect(icon()).toBeNull();
  });

  it('registers every name exactly once', () => {
    const names = ICONS.map((icon) => icon.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
