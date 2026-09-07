import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckoutStore } from './checkout-store';

/**
 * Checkout runs in order: where it goes, how it is paid for, then what is being
 * ordered. A later step reached before an earlier one is answered would render
 * over blanks — the review screen would name no address and charge nothing — so
 * it sends the person back to the first question still unanswered.
 *
 * The step indicator no longer links anywhere, which stops the obvious way of
 * skipping ahead; this stops the rest of them, typed URLs and stale history
 * entries included.
 */
export const checkoutStepGuard =
  (step: 'payment' | 'review'): CanActivateFn =>
  () => {
    const checkout = inject(CheckoutStore);
    const router = inject(Router);

    if (!checkout.addressDone()) return router.createUrlTree(['/checkout/address']);

    if (step === 'review' && !checkout.paymentDone()) {
      return router.createUrlTree(['/checkout/payment']);
    }

    return true;
  };
