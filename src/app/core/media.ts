import { inject } from '@angular/core';
import { API_BASE_URL } from './auth/api.config';

/**
 * Turns a stored picture reference into something an `<img>` can load.
 *
 * Two kinds arrive. An uploaded avatar is a path on the API host, because the
 * server that stored the file is the server that serves it and it should not
 * have to know its own public address. Anything else — the seeded pictures, for
 * instance — is already an absolute URL and is handed back untouched.
 *
 * In development the API is on a different port from the app, so a bare path
 * would resolve against the wrong origin and quietly render a broken image.
 */
export function mediaUrl(api: string, value: string | null | undefined): string {
  if (!value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) return value;

  return new URL(value, new URL(api).origin).toString();
}

/** The same thing for callers that would rather inject than pass the base URL. */
export function injectMediaUrl(): (value: string | null | undefined) => string {
  const api = inject(API_BASE_URL);
  return (value) => mediaUrl(api, value);
}
