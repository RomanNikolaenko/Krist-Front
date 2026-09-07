import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth/auth.service';
import { CheckoutStore, ShipTo } from './checkout-store';

const ADDRESS: ShipTo = {
  id: 'addr-1',
  name: 'Marcus Bell',
  phone: '+1 555 0100',
  line1: '3320 E Brown Rd',
  area: 'East Mesa',
  city: 'Mesa',
  pin: '85201',
  state: 'Nevada',
  isDefault: true,
};

describe('CheckoutStore', () => {
  let signedIn: ReturnType<typeof signal<boolean>>;
  let store: CheckoutStore;

  beforeEach(() => {
    localStorage.clear();
    signedIn = signal(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { isAuthenticated: signedIn } }],
    });

    store = TestBed.inject(CheckoutStore);
    store.reset();
  });

  it('counts a step as answered only once it has been answered', () => {
    expect(store.addressDone()).toBe(false);
    expect(store.paymentDone()).toBe(false);

    store.deliverTo(ADDRESS);
    expect(store.addressDone()).toBe(true);
    expect(store.paymentDone()).toBe(false);
  });

  it('keeps a guest their answers — there is nowhere else to put them', () => {
    store.deliverTo({ ...ADDRESS, id: null });
    TestBed.tick();

    expect(store.address()?.name).toBe('Marcus Bell');
  });

  it('forgets everything when somebody signs out', () => {
    signedIn.set(true);
    TestBed.tick();

    store.deliverTo(ADDRESS);
    store.payBy({ method: 'card', cardId: 'card-1', last4: '1188' });

    signedIn.set(false);
    TestBed.tick();

    // Somebody else's address should not be waiting in the next person's checkout.
    expect(store.address()).toBeNull();
    expect(store.payment()).toBeNull();
  });

  it('survives a reload', () => {
    store.deliverTo(ADDRESS);
    TestBed.tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { isAuthenticated: signal(false) } }],
    });

    expect(TestBed.inject(CheckoutStore).address()?.id).toBe('addr-1');
  });
});
