import { computed, Injectable } from '@angular/core';
import { Address, SavedCard } from './models';
import { ADDRESSES, PROFILE, SAVED_CARDS } from './data/content';
import { persistentSignal } from './storage';

export type PaymentMethod = 'card' | 'gpay' | 'paypal' | 'cod';

@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly addressList = persistentSignal<Address[]>('krist.addresses', ADDRESSES);
  // v2: saved cards gained a `label` and dropped the amex brand.
  private readonly cardList = persistentSignal<SavedCard[]>('krist.cards', SAVED_CARDS, 2);
  private readonly profileState = persistentSignal('krist.profile', PROFILE);

  private readonly selectedAddressId = persistentSignal<number | null>(
    'krist.checkout.address',
    ADDRESSES.find((a) => a.isDefault)?.id ?? null,
  );
  private readonly paymentMethod = persistentSignal<PaymentMethod>(
    'krist.checkout.payment',
    'card',
  );

  readonly addresses = this.addressList.asReadonly();
  readonly cards = this.cardList.asReadonly();
  readonly profile = this.profileState.asReadonly();
  readonly payment = this.paymentMethod.asReadonly();

  readonly fullName = computed(
    () => `${this.profileState().firstName} ${this.profileState().lastName}`,
  );

  readonly selectedAddress = computed<Address | null>(
    () =>
      this.addressList().find((a) => a.id === this.selectedAddressId()) ??
      this.addressList()[0] ??
      null,
  );

  addAddress(address: Omit<Address, 'id'>): Address {
    const id = Math.max(0, ...this.addressList().map((a) => a.id)) + 1;
    const created: Address = { ...address, id };

    this.addressList.update((list) => {
      const next = created.isDefault ? list.map((a) => ({ ...a, isDefault: false })) : list;
      return [...next, created];
    });

    if (created.isDefault) this.selectedAddressId.set(id);
    return created;
  }

  updateAddress(id: number, patch: Partial<Address>): void {
    this.addressList.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  removeAddress(id: number): void {
    this.addressList.update((list) => list.filter((a) => a.id !== id));
    if (this.selectedAddressId() === id) {
      this.selectedAddressId.set(this.addressList()[0]?.id ?? null);
    }
  }

  selectAddress(id: number): void {
    this.selectedAddressId.set(id);
  }

  addCard(card: Omit<SavedCard, 'id'>): void {
    const id = Math.max(0, ...this.cardList().map((c) => c.id)) + 1;
    this.cardList.update((list) => [...list, { ...card, id }]);
  }

  removeCard(id: number): void {
    this.cardList.update((list) => list.filter((c) => c.id !== id));
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  updateProfile(patch: Partial<typeof PROFILE>): void {
    this.profileState.update((p) => ({ ...p, ...patch }));
  }
}
