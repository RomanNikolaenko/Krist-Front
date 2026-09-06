import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
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
       * 401 means the session is not valid — expired, revoked, or never there.
       *
       * `/auth/me` is exempt because it is the question itself: answering it
       * with a redirect to login would fire on every first visit. And the login
       * endpoint is exempt because a wrong password is a 401 the form should
       * show, not a reason to navigate away from the form.
       */
      if (error.status === 401 && !isAuthProbe(request.url, api)) {
        auth.clear();

        // Guard against the loop: only navigate if we are not already there.
        const onAuthScreen = /\/(login|signup|forgot-password|otp|reset-password)/.test(router.url);
        if (!onAuthScreen) {
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

function isAuthProbe(url: string, api: string): boolean {
  return url.startsWith(`${api}/auth/me`) || url.startsWith(`${api}/auth/login`);
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
