import { HttpErrorResponse } from '@angular/common/http';

/**
 * What the API says when it refuses.
 *
 * `class-validator` answers with an array — one string per rule the request
 * broke — while everything thrown by hand answers with a sentence.
 */
interface ApiErrorBody {
  message?: string | string[];
}

/**
 * The server's own words, or a fallback when it had none.
 *
 * Five screens each carried a private copy of this, which is four too many for
 * something that has to agree with itself: a rejected form is only useful if it
 * says which rule it broke, and "something went wrong" over the top of that is
 * worse than useless — trying again changes nothing.
 *
 * `fallback` is a translation key on most screens and a sentence on the auth
 * ones; either way it is only reached for the failures worth retrying, a
 * dropped connection or a 500.
 */
export function apiMessage(failure: unknown, fallback: string): string {
  const body = failure instanceof HttpErrorResponse ? (failure.error as ApiErrorBody | null) : null;
  const message = body?.message;

  if (Array.isArray(message) && message.length) return message[0];
  if (typeof message === 'string' && message) return message;

  return fallback;
}
