import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from './api.config';

const CSRF_COOKIE = 'krist_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Everything the browser has to do for cookie-based sessions, in one place.
 *
 * Three jobs:
 *
 *  1. `withCredentials` on API calls, or the browser never attaches the session
 *     cookie to a cross-origin request and every call arrives anonymous.
 *  2. Echo the CSRF cookie into a header. The server sets that cookie readable
 *     on purpose — a page on another site can make the browser *send* cookies
 *     but the same-origin policy stops it *reading* them, so only our own page
 *     can produce this header.
 *  3. Turn 401 into "the session is gone" exactly once, without a redirect loop.
 *
 * Scoped to the API on purpose. The icon registry fetches `svg/*.svg` from the
 * app's own origin through the same HttpClient, and attaching credentials and a
 * CSRF header to static assets would be noise at best and a preflight on every
 * icon at worst.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const api = inject(API_BASE_URL);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!request.url.startsWith(api)) return next(request);

  let outbound = request.clone({ withCredentials: true });

  if (!SAFE_METHODS.has(request.method)) {
    const token = readCookie(CSRF_COOKIE);
    if (token) outbound = outbound.clone({ setHeaders: { [CSRF_HEADER]: token } });
  }

  return next(outbound).pipe(
    catchError((error: HttpErrorResponse) => {
      /*
       * 401 usually means the session is not valid — expired, revoked, or
       * never there. Not always, though: a handful of endpoints check a
       * password carried in the request body and answer 401 when it is wrong,
       * and there the session is perfectly fine. Signing the person out for
       * mistyping their own password would be absurd, so those answer for
       * themselves and the screen shows the message.
       */
      if (error.status === 401 && !checksAPasswordItself(request.url, api)) {
        auth.clear();

        /*
         * A session can lapse while the tab sits open. Forgetting it is right
         * either way; moving the person is not. Somebody reading the catalogue
         * simply becomes a guest where they stand — being thrown to a sign-in
         * form because a cookie quietly expired is the rudest thing an app can
         * do to a reader. Only a screen that needed a session to reach sends
         * them on, and with a returnUrl so they come back to it.
         */
        if (onGuardedRoute(router)) {
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
      }
      /*
       * 403 is different in kind: the session is fine, the account simply may
       * not do this. Signing the user out or bouncing them to login would be
       * both wrong and confusing — the caller shows the message instead.
       */
      return throwError(() => error);
    }),
  );
};

/**
 * Whether the screen in front of the user needed a session to reach.
 *
 * Taken from the router's own state rather than a list of paths kept in step
 * by hand: a route is protected because it declares a guard, and reading that
 * stays correct when the routes change.
 */
function onGuardedRoute(router: Router): boolean {
  let route: ActivatedRouteSnapshot | null = router.routerState.snapshot.root;

  while (route) {
    if (route.routeConfig?.canActivate?.length) return true;
    route = route.firstChild;
  }

  return false;
}

/**
 * Endpoints whose 401 is about the credentials in the body rather than the
 * session carrying the request.
 *
 * `/auth/me` is here for a different reason: it is the question itself, and
 * answering it with a redirect would fire on every first visit by a guest.
 *
 * Matched exactly rather than by prefix, because `DELETE /account` checks a
 * password while everything under `/account/…` is ordinary session-protected
 * data that should still redirect when the session really has gone.
 */
function checksAPasswordItself(url: string, api: string): boolean {
  const path = url.split('?')[0];

  return (
    path === `${api}/auth/me` ||
    path === `${api}/auth/login` ||
    path === `${api}/auth/change-password` ||
    path === `${api}/account`
  );
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
