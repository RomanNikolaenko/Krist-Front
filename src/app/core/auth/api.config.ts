import { InjectionToken } from '@angular/core';

/**
 * Where the API lives.
 *
 * A token rather than a constant so a test can point the app somewhere else
 * without touching a file, and so a deployment can override it in one provider.
 *
 * In development this is a different port, which is still the *same site* —
 * a port is not part of a site — so `SameSite=Lax` cookies travel normally.
 * Only a genuinely different domain would need `SameSite=None; Secure`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000/api',
});
