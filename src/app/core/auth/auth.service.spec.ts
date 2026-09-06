import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

const API = 'http://api.test/api';

const USER = {
  id: 'u1',
  email: 'robert@example.com',
  emailVerified: true,
  status: 'ACTIVE',
  firstName: 'Robert',
  lastName: 'Fox',
  roles: ['CUSTOMER'],
  permissions: ['products.read'],
};

describe('AuthService', () => {
  let auth: AuthService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API },
      ],
    });

    auth = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('starts in the unknown state, not signed out', () => {
    // The distinction is what stops the login screen flashing on every reload.
    expect(auth.status()).toBe('unknown');
    expect(auth.resolved()).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('resolves to authenticated when the server knows us', async () => {
    const pending = auth.refresh();
    controller.expectOne(`${API}/auth/me`).flush({ authenticated: true, user: USER });
    await pending;

    expect(auth.status()).toBe('authenticated');
    expect(auth.resolved()).toBe(true);
    expect(auth.user()?.email).toBe('robert@example.com');
    expect(auth.fullName()).toBe('Robert Fox');
  });

  it('resolves to unauthenticated when it does not', async () => {
    const pending = auth.refresh();
    controller.expectOne(`${API}/auth/me`).flush({ authenticated: false });
    await pending;

    expect(auth.status()).toBe('unauthenticated');
    expect(auth.resolved()).toBe(true);
  });

  it('treats an unreachable API as signed out rather than staying unknown', async () => {
    const pending = auth.refresh();
    controller.expectOne(`${API}/auth/me`).error(new ProgressEvent('network'));
    await pending;

    // Otherwise the app never renders at all when the API blips.
    expect(auth.status()).toBe('unauthenticated');
    expect(auth.resolved()).toBe(true);
  });

  it('signs in from the login response without a second round trip', async () => {
    const pending = auth.login('robert@example.com', 'Password-1234');
    controller.expectOne(`${API}/auth/login`).flush({ authenticated: true, user: USER });
    await pending;

    expect(auth.isAuthenticated()).toBe(true);
  });

  it('never stores a token anywhere the page can read', async () => {
    const pending = auth.login('robert@example.com', 'Password-1234');
    controller.expectOne(`${API}/auth/login`).flush({ authenticated: true, user: USER });
    await pending;

    expect(localStorage.getItem('krist.session')).toBeNull();
    expect(Object.keys(localStorage).some((k) => /token|session|auth/i.test(k))).toBe(false);
    expect(Object.keys(sessionStorage)).toHaveLength(0);
  });

  it('clears local state on logout even when the call fails', async () => {
    const signIn = auth.login('robert@example.com', 'Password-1234');
    controller.expectOne(`${API}/auth/login`).flush({ authenticated: true, user: USER });
    await signIn;

    const pending = auth.logout();
    controller.expectOne(`${API}/auth/logout`).error(new ProgressEvent('network'));
    await pending;

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it('answers permission and role questions from the resolved user', async () => {
    const pending = auth.refresh();
    controller.expectOne(`${API}/auth/me`).flush({ authenticated: true, user: USER });
    await pending;

    expect(auth.has('products.read')).toBe(true);
    expect(auth.has('orders.write')).toBe(false);
    expect(auth.is('CUSTOMER')).toBe(true);
    expect(auth.is('ADMIN')).toBe(false);
  });

  it('registration does not sign anyone in', async () => {
    const pending = auth.register({
      email: 'new@example.com',
      password: 'Password-1234',
      firstName: 'New',
      lastName: 'Person',
    });
    controller.expectOne(`${API}/auth/register`).flush({ message: 'Check your inbox' });
    await pending;

    expect(auth.isAuthenticated()).toBe(false);
  });
});
