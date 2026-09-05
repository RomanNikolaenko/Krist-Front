import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Catalog, EMPTY_FILTERS, PAGE_SIZE } from './catalog';
import { PRODUCTS } from './data/products';
import { ShopFilters } from './models';

const filters = (patch: Partial<ShopFilters> = {}): ShopFilters => ({ ...EMPTY_FILTERS, ...patch });

describe('Catalog', () => {
  let catalog: Catalog;

  beforeEach(() => {
    TestBed.resetTestingModule();
    catalog = TestBed.inject(Catalog);
  });

  it('returns the first page with the full result count', () => {
    const result = catalog.search(filters());

    expect(result.total).toBe(PRODUCTS.length);
    expect(result.items).toHaveLength(PAGE_SIZE);
    expect(result.from).toBe(1);
    expect(result.to).toBe(PAGE_SIZE);
    expect(result.pages).toBe(Math.ceil(PRODUCTS.length / PAGE_SIZE));
  });

  it('reports the right window on a later page', () => {
    const result = catalog.search(filters({ page: 2 }));

    expect(result.from).toBe(PAGE_SIZE + 1);
    expect(result.to).toBe(Math.min(PAGE_SIZE * 2, PRODUCTS.length));
  });

  it('clamps a page number beyond the last page', () => {
    const result = catalog.search(filters({ page: 99 }));

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.to).toBe(PRODUCTS.length);
  });

  it('filters by category', () => {
    const result = catalog.search(filters({ categories: ['Bags'] }));

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((p) => p.category === 'Bags')).toBe(true);
  });

  it('treats several categories as OR', () => {
    const bags = catalog.search(filters({ categories: ['Bags'] })).total;
    const watches = catalog.search(filters({ categories: ['Watches'] })).total;
    const both = catalog.search(filters({ categories: ['Bags', 'Watches'] })).total;

    expect(both).toBe(bags + watches);
  });

  it('filters by colour and by size', () => {
    const red = catalog.search(filters({ colors: ['Red'] }));
    expect(red.items.every((p) => p.colors.includes('Red'))).toBe(true);

    const xxxl = catalog.search(filters({ sizes: ['XXXL'] }));
    expect(xxxl.total).toBeGreaterThan(0);
    expect(xxxl.items.every((p) => p.sizes.includes('XXXL'))).toBe(true);
  });

  it('combines facets as AND across facet groups', () => {
    const result = catalog.search(filters({ categories: ['Winter Wear'], sizes: ['XXXL'] }));

    expect(
      result.items.every((p) => p.category === 'Winter Wear' && p.sizes.includes('XXXL')),
    ).toBe(true);
  });

  it('drops products above the price ceiling', () => {
    const result = catalog.search(filters({ maxPrice: 40 }));

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((p) => p.price <= 40)).toBe(true);
  });

  it('returns an empty window when nothing matches', () => {
    const result = catalog.search(filters({ maxPrice: 1 }));

    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
    expect(result.from).toBe(0);
    expect(result.pages).toBe(1);
  });

  it('sorts by price in both directions', () => {
    const asc = catalog.search(filters({ sort: 'price-asc' })).items.map((p) => p.price);
    const desc = catalog.search(filters({ sort: 'price-desc' })).items.map((p) => p.price);

    expect([...asc]).toEqual([...asc].sort((a, b) => a - b));
    expect([...desc]).toEqual([...desc].sort((a, b) => b - a));
  });

  it('derives facet counts from the catalogue', () => {
    const red = catalog.colorCounts().find((c) => c.name === 'Red')!;
    expect(red.count).toBe(PRODUCTS.filter((p) => p.colors.includes('Red')).length);

    const medium = catalog.sizeCounts().find((s) => s.name === 'M')!;
    expect(medium.count).toBe(PRODUCTS.filter((p) => p.sizes.includes('M')).length);
  });

  it('looks products up by slug and never suggests the product itself as related', () => {
    const product = PRODUCTS[7];

    expect(catalog.bySlug(product.slug)?.id).toBe(product.id);
    expect(catalog.bySlug('does-not-exist')).toBeUndefined();

    const related = catalog.related(product, 4);
    expect(related).toHaveLength(4);
    expect(related.some((p) => p.id === product.id)).toBe(false);
  });
});
