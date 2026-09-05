import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';

/**
 * Keeps the profile behind a sign-in. A visitor who lands there is sent to the
 * login screen with `returnUrl`, so the trip through the form drops them where
 * they were headed rather than on the profile's front page.
 *
 * Guarding the parent route covers every child: they are only reachable
 * through it.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
