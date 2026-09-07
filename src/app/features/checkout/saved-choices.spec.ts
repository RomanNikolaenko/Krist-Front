import { signal, Type, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountStore } from '../../core/account-store';
import { AuthService } from '../../core/auth/auth.service';
import { CheckoutStore } from '../../core/checkout-store';
import { Address, SavedCard } from '../../core/models';
import { PaymentMethodPage } from './payment-method';
import { ShippingAddress } from './shipping-address';

/*
 * One rule, checked on both screens: the shortcut of picking something already
 * saved is offered only to somebody who has an account and something in it.
 * A guest gets the form on its own — not an empty list, and not a heading over
 * one — because a guest has nowhere for saved things to live.
 */

const ADDRESS: Address = {
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

const CARD: SavedCard = {
  id: 'card-1',
  label: 'Master Card',
  holder: 'Marcus Bell',
  brand: 'MASTERCARD',
  last4: '1188',
  expiryMonth: 4,
  expiryYear: 2030,
  isDefault: true,
};

interface Stubs {
  signedIn: WritableSignal<boolean>;
  addresses: WritableSignal<Address[]>;
  cards: WritableSignal<SavedCard[]>;
  addAddress: ReturnType<typeof vi.fn>;
  navigate: ReturnType<typeof vi.fn>;
}

function setUp(): Stubs {
  const signedIn = signal(false);
  const addresses = signal<Address[]>([]);
  const cards = signal<SavedCard[]>([]);
  const addAddress = vi.fn(async (draft: Omit<Address, 'id'>) => ({ ...draft, id: 'addr-new' }));
  const navigate = vi.fn(async () => true);

  localStorage.clear();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { isAuthenticated: signedIn } },
      {
        provide: AccountStore,
        useValue: {
          addresses,
          cards,
          defaultAddress: signal(null),
          defaultCard: signal(null),
          addAddress,
          removeAddress: vi.fn(async () => undefined),
          addCard: vi.fn(async () => CARD),
        },
      },
    ],
  });

  // Real navigation would tear the fixture down mid-assertion.
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockImplementation(navigate);

  TestBed.inject(CheckoutStore).reset();

  return { signedIn, addresses, cards, addAddress, navigate };
}

function render<T>(component: Type<T>): ComponentFixture<T> {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

describe('the shipping address step', () => {
  let stubs: Stubs;

  beforeEach(() => {
    stubs = setUp();
  });

  it('offers a guest the form alone', () => {
    const fixture = render(ShippingAddress);

    expect(fixture.nativeElement.querySelector('.cards')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-address-form')).not.toBeNull();
  });

  it('offers no list to somebody signed in who has saved nothing', () => {
    stubs.signedIn.set(true);
    const fixture = render(ShippingAddress);

    expect(fixture.nativeElement.querySelector('.cards')).toBeNull();
  });

  it('offers the saved ones once there are some', () => {
    stubs.signedIn.set(true);
    stubs.addresses.set([ADDRESS]);
    const fixture = render(ShippingAddress);

    expect(fixture.nativeElement.querySelectorAll('.cards .card')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Marcus Bell');
  });

  it("keeps a guest's typed address in the checkout rather than the account", async () => {
    const fixture = render(ShippingAddress);
    const checkout = TestBed.inject(CheckoutStore);

    await fixture.componentInstance['useNew']({ ...ADDRESS, id: undefined } as never);

    expect(stubs.addAddress).not.toHaveBeenCalled();
    expect(checkout.address()?.id).toBeNull();
    expect(checkout.addressDone()).toBe(true);
    expect(stubs.navigate).toHaveBeenCalledWith(['/checkout/payment']);
  });

  it('saves a signed-in address to the account on the way past', async () => {
    stubs.signedIn.set(true);
    const fixture = render(ShippingAddress);
    const checkout = TestBed.inject(CheckoutStore);

    await fixture.componentInstance['useNew']({ ...ADDRESS, id: undefined } as never);

    expect(stubs.addAddress).toHaveBeenCalledOnce();
    expect(checkout.address()?.id).toBe('addr-new');
  });
});

describe('the payment step', () => {
  let stubs: Stubs;

  beforeEach(() => {
    stubs = setUp();
  });

  it('offers a guest the card form alone', () => {
    const fixture = render(PaymentMethodPage);

    expect(fixture.nativeElement.querySelector('.cards')).toBeNull();
    expect(fixture.nativeElement.querySelector('.card-form')).not.toBeNull();
  });

  it('offers the saved cards once there are some', () => {
    stubs.signedIn.set(true);
    stubs.cards.set([CARD]);
    const fixture = render(PaymentMethodPage);

    expect(fixture.nativeElement.querySelectorAll('.saved')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('1188');
  });

  it('will not go on with a card method and no card', () => {
    const fixture = render(PaymentMethodPage);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.continue');

    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.need-card')).not.toBeNull();
  });

  it('goes on for a method that needs no card', () => {
    const fixture = render(PaymentMethodPage);

    fixture.componentInstance['method'].set('cod');
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.continue');
    expect(button.disabled).toBe(false);

    button.click();
    expect(TestBed.inject(CheckoutStore).payment()).toEqual({
      method: 'cod',
      cardId: null,
      last4: null,
    });
  });
});
