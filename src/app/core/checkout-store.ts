import { computed, effect, inject, Injectable, untracked } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Address, PaymentMethod } from './models';
import { persistentSignal } from './storage';

/**
 * Where this order is going. A snapshot rather than a reference, because the
 * person answering may not have an account to keep addresses in: `id` is filled
 * only when they picked one they had saved.
 */
export type ShipTo = Omit<Address, 'id'> & { id: string | null };

/**
 * How this order is paid for. Card numbers never reach this — a real checkout
 * hands the card to a processor and keeps the token; the last four digits are
 * here so the review screen can say which card without holding one.
 */
export interface PayWith {
  method: PaymentMethod;
  /** The saved card it will be charged to, when one was picked. */
  cardId: string | null;
  last4: string | null;
}

/**
 * The three checkout screens ask three questions, and this holds the answers.
 *
 * It is deliberately separate from the account: a guest can answer all of them
 * without ever having somewhere to save them, and a signed-in person's saved
 * addresses are a convenience for answering, not the answer itself. The guard
 * on the routes reads `addressDone` / `paymentDone` from here, so an unanswered
 * question is what stops somebody skipping ahead.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  private readonly auth = inject(AuthService);

  private readonly shipTo = persistentSignal<ShipTo | null>('krist.checkout.ship-to', null);
  private readonly payWith = persistentSignal<PayWith | null>('krist.checkout.pay-with', null);

  readonly address = this.shipTo.asReadonly();
  readonly payment = this.payWith.asReadonly();

  readonly addressDone = computed(() => this.shipTo() !== null);
  readonly paymentDone = computed(() => this.payWith() !== null);

  constructor() {
    /*
     * Signing out has to take the answers with it. Not for correctness — the
     * next person would simply overwrite them — but because an address and a
     * card ending in four digits are somebody's, and a shared machine should
     * not hand them to whoever opens the checkout next. A guest who never
     * signed in keeps theirs: `wasSignedIn` only flips on a real sign-in, so
     * the false-to-false pass at boot clears nothing.
     */
    let wasSignedIn = false;

    effect(() => {
      const signedIn = this.auth.isAuthenticated();

      untracked(() => {
        if (wasSignedIn && !signedIn) this.reset();
        wasSignedIn = signedIn;
      });
    });
  }

  deliverTo(address: ShipTo): void {
    this.shipTo.set(address);
  }

  payBy(payment: PayWith): void {
    this.payWith.set(payment);
  }

  /** After an order is placed: the next one starts by being asked again. */
  reset(): void {
    this.shipTo.set(null);
    this.payWith.set(null);
  }
}
