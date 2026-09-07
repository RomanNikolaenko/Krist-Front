import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth/auth.service';
import { CheckoutStore, ShipTo } from './checkout-store';
import { checkoutStepGuard } from './checkout.guard';

const ADDRESS: ShipTo = {
  id: null,
  name: 'Marcus Bell',
  phone: '+1 555 0100',
  line1: '3320 E Brown Rd',
  area: 'East Mesa',
  city: 'Mesa',
  pin: '85201',
  state: 'Nevada',
  isDefault: false,
};

/** The guard only asks whether somebody is signed in through the store. */
const authStub = { isAuthenticated: signal(false) };

function run(step: 'payment' | 'review'): true | UrlTree {
  const guard = checkoutStepGuard(step);

  return TestBed.runInInjectionContext(() => guard(null as never, null as never) as true | UrlTree);
}

describe('checkoutStepGuard', () => {
  let checkout: CheckoutStore;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authStub }],
    });

    checkout = TestBed.inject(CheckoutStore);
    router = TestBed.inject(Router);
    checkout.reset();
  });

  it('sends an unanswered checkout back to the address step', () => {
    const result = run('payment');

    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/address');
  });

  it('opens the payment step once there is an address', () => {
    checkout.deliverTo(ADDRESS);

    expect(run('payment')).toBe(true);
  });

  it('sends review back to payment when only the address is answered', () => {
    checkout.deliverTo(ADDRESS);

    const result = run('review');

    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/payment');
  });

  it('sends review back to the address step when nothing is answered at all', () => {
    checkout.payBy({ method: 'cod', cardId: null, last4: null });

    // Not to payment: the first unanswered question is the one to go back to.
    expect(router.serializeUrl(run('review') as UrlTree)).toBe('/checkout/address');
  });

  it('opens review once both are answered', () => {
    checkout.deliverTo(ADDRESS);
    checkout.payBy({ method: 'card', cardId: 'card-1', last4: '1188' });

    expect(run('review')).toBe(true);
  });
});
