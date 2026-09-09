import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Keeps a route behind a sign-in, and waits for the answer before deciding.
 *
 * The wait is the point. Guards run before the app has painted, and on a
 * reload the first `/auth/me` may still be in flight — deciding then would
 * bounce a signed-in user to the login screen for no reason. `resolved()` is
 * already true by the time this runs in practice, because the app initializer
 * awaits it, but a guard that assumes that would break the moment someone
 * lazy-loads differently.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.resolved()) await auth.refresh();

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Opens a section to anybody holding at least one of these.
 *
 * The admin shell is several screens with different owners: whoever runs the
 * catalogue needs `products.write`, whoever answers "where is my parcel" needs
 * only `orders.read`. Requiring all of them at the door would keep support out
 * of the one screen it exists for.
 */
export const anyPermissionGuard =
  (...permissions: string[]): CanActivateFn =>
  async (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.resolved()) await auth.refresh();

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    if (permissions.some((permission) => auth.has(permission))) return true;

    return router.createUrlTree(['/']);
  };

/**
 * Authorization for the UI only — it decides what to render, never what is
 * allowed. The API checks the same permission again and is the one that counts;
 * a guard here that someone bypassed would gain them nothing.
 */
export const permissionGuard =
  (...permissions: string[]): CanActivateFn =>
  async (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.resolved()) await auth.refresh();

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    if (permissions.every((permission) => auth.has(permission))) return true;

    // Not the login screen: they are signed in, they simply may not go here.
    return router.createUrlTree(['/']);
  };
