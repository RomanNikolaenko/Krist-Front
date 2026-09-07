import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CartStore } from './cart-store';
import { Product } from './models';
import { DELIVERY_CHARGE } from './data/content';

/**
 * The catalogue lives on the server now, so the cart is tested against two
 * products built here. That is the better test anyway: it fixes the prices the
 * arithmetic depends on instead of reading them out of whatever the shop
 * happens to be selling.
 */
const product = (id: string, name: string, price: number): Product => ({
  id,
  slug: id,
  brand: 'Krist',
  name,
  price,
  oldPrice: null,
  categories: ['Men'],
  colors: ['Black'],
  sizes: ['S', 'M', 'L'],
  rating: null,
  reviewCount: 0,
  inStock: true,
  images: ['/img.png'],
  description: '',
});

const dress = product('dress', 'Girls Pink Moana Printed Dress', 80);
const shirt = product('shirt', 'Tailored Cotton Casual Shirt', 40);

describe('CartStore', () => {
  let cart: CartStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    cart = TestBed.inject(CartStore);
    cart.clear();
  });

  it('starts empty', () => {
    expect(cart.items()).toEqual([]);
    expect(cart.count()).toBe(0);
    expect(cart.subtotal()).toBe(0);
    expect(cart.deliveryCharge()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  it('adds a product with the chosen size and colour', () => {
    cart.add(dress, 'S', 'Red', 1);

    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0]).toMatchObject({ productId: dress.id, size: 'S', color: 'Red', qty: 1 });
    expect(cart.subtotal()).toBe(dress.price);
  });

  it('merges a repeat add of the same variant instead of duplicating the row', () => {
    cart.add(dress, 'S', 'Red', 1);
    cart.add(dress, 'S', 'Red', 2);

    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].qty).toBe(3);
    expect(cart.count()).toBe(3);
  });

  it('keeps different sizes of the same product as separate rows', () => {
    cart.add(dress, 'S', 'Red', 1);
    cart.add(dress, 'M', 'Red', 1);

    expect(cart.items()).toHaveLength(2);
    expect(cart.count()).toBe(2);
  });

  it('sums the subtotal across rows and quantities', () => {
    cart.add(dress, 'S', 'Red', 2); // 160
    cart.add(shirt, 'M', 'Blue', 1); // 40

    expect(cart.subtotal()).toBe(dress.price * 2 + shirt.price);
  });

  it('drops a row when its quantity falls below one', () => {
    cart.add(dress, 'S', 'Red', 1);
    cart.setQty(cart.items()[0].id, 0);

    expect(cart.items()).toEqual([]);
  });

  it('removes a row by id', () => {
    cart.add(dress, 'S', 'Red', 1);
    cart.add(shirt, 'M', 'Blue', 1);
    cart.remove(cart.items()[0].id);

    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].productId).toBe(shirt.id);
  });

  it('charges delivery only once the cart has something in it', () => {
    expect(cart.deliveryCharge()).toBe(0);
    cart.add(shirt, 'M', 'Blue', 1);
    expect(cart.deliveryCharge()).toBe(DELIVERY_CHARGE);
    expect(cart.total()).toBe(shirt.price + DELIVERY_CHARGE);
  });

  it('applies a known discount code and rejects an unknown one', () => {
    cart.add(dress, 'S', 'Red', 2); // 160

    expect(cart.applyCode('flat50')).toBe(true);
    expect(cart.discount()).toBe(50);
    expect(cart.total()).toBe(160 - 50 + DELIVERY_CHARGE);

    expect(cart.applyCode('NOPE')).toBe(false);
    expect(cart.appliedCode()).toBe('FLAT50');
  });

  it('never discounts more than the subtotal', () => {
    cart.add(shirt, 'M', 'Blue', 1); // 40
    cart.applyCode('FLAT50');

    expect(cart.discount()).toBe(40);
    expect(cart.total()).toBe(DELIVERY_CHARGE);
  });

  it('clears items and the applied code together', () => {
    cart.add(dress, 'S', 'Red', 1);
    cart.applyCode('FLAT50');
    cart.clear();

    expect(cart.items()).toEqual([]);
    expect(cart.appliedCode()).toBeNull();
    expect(cart.discount()).toBe(0);
  });
});
