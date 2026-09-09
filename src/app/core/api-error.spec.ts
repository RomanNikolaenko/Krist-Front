import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { apiMessage } from './api-error';

/*
 * Six screens each had their own copy of this, and the copies had drifted:
 * some preferred the string, some the array, one fell back to a raw English
 * sentence in a translated app. One helper, one order of preference.
 */
describe('apiMessage', () => {
  const failure = (body: unknown): HttpErrorResponse =>
    new HttpErrorResponse({ status: 400, error: body });

  it('prefers the first of the validator messages', () => {
    const message = apiMessage(
      failure({ message: ['Price is required', 'Name is too long'] }),
      'x',
    );

    expect(message).toBe('Price is required');
  });

  it('takes a plain sentence as it comes', () => {
    expect(apiMessage(failure({ message: 'That address is not yours' }), 'x')).toBe(
      'That address is not yours',
    );
  });

  it('falls back when the server said nothing useful', () => {
    expect(apiMessage(failure({}), 'Try again')).toBe('Try again');
    expect(apiMessage(failure({ message: [] }), 'Try again')).toBe('Try again');
    expect(apiMessage(failure({ message: '' }), 'Try again')).toBe('Try again');
  });

  it('falls back for anything that is not an HTTP failure at all', () => {
    expect(apiMessage(new Error('socket hang up'), 'Try again')).toBe('Try again');
    expect(apiMessage(null, 'Try again')).toBe('Try again');
  });
});
