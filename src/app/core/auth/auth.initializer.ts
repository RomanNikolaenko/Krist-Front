import { inject, provideAppInitializer } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Asks the server who we are before the first route renders.
 *
 * Without this the app paints in the `unknown` state, guards run against an
 * answer nobody has yet, and a signed-in user watches the login screen flash
 * past on every reload. One request, awaited once, removes the whole class of
 * problem.
 */
export const provideAuthInitializer = () =>
  provideAppInitializer(() => inject(AuthService).refresh());
