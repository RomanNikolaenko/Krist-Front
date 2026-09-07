import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from './api.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

const API = 'http://api.test/api';

@Component({ template: '' })
class Blank {}

/**
 * One open screen and one behind a guard: the interceptor decides whether to
 * move the user by reading which of the two they are standing on.
 */
const routes = [
  { path: 'shop', component: Blank },
  { path: 'profile', component: Blank, canActivate: [() => true] },
];

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    document.cookie = 'krist_csrf=csrf-value; path=/';

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API },
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    controller.verify();
    document.cookie = 'krist_csrf=; path=/; max-age=0';
  });

  it('sends credentials on API calls, so the session cookie travels', () => {
    http.get(`${API}/auth/me`).subscribe();

    const request = controller.expectOne(`${API}/auth/me`);
    expect(request.request.withCredentials).toBe(true);
    request.flush({ authenticated: false });
  });

  it('echoes the CSRF cookie into a header on writes', () => {
    http.post(`${API}/auth/logout`, {}).subscribe();

    const request = controller.expectOne(`${API}/auth/logout`);
    expect(request.request.headers.get('X-CSRF-Token')).toBe('csrf-value');
    request.flush({});
  });

  it('leaves reads alone — a GET cannot be a CSRF target', () => {
    http.get(`${API}/auth/sessions`).subscribe();

    const request = controller.expectOne(`${API}/auth/sessions`);
    expect(request.request.headers.has('X-CSRF-Token')).toBe(false);
    request.flush([]);
  });

  it('does not touch requests outside the API', () => {
    // The icon registry pulls svg/* through this same client; credentials and
    // a CSRF header on static assets would be noise, and a preflight per icon.
    http.get('svg/search.svg', { responseType: 'text' }).subscribe();

    const request = controller.expectOne('svg/search.svg');
    expect(request.request.withCredentials).toBe(false);
    expect(request.request.headers.has('X-CSRF-Token')).toBe(false);
    request.flush('<svg></svg>');
  });

  it('clears the session but leaves a reader where they are', async () => {
    await router.navigate(['/shop']);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get(`${API}/auth/sessions`).subscribe({ error: () => undefined });
    controller
      .expectOne(`${API}/auth/sessions`)
      .flush({ message: 'Authentication required' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isAuthenticated()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sends them to sign in when the screen needed a session', async () => {
    await router.navigate(['/profile']);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get(`${API}/auth/sessions`).subscribe({ error: () => undefined });
    controller
      .expectOne(`${API}/auth/sessions`)
      .flush({ message: 'Authentication required' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('does not redirect when /auth/me answers 401 — that is the question itself', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    http.get(`${API}/auth/me`).subscribe({ error: () => undefined });

    controller.expectOne(`${API}/auth/me`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not redirect when login itself answers 401 — the form shows it', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    http.post(`${API}/auth/login`, {}).subscribe({ error: () => undefined });

    controller
      .expectOne(`${API}/auth/login`)
      .flush({ message: 'Email or password is incorrect' }, { status: 401, statusText: 'x' });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not sign anyone out for mistyping their current password', async () => {
    await router.navigate(['/profile']);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.post(`${API}/auth/change-password`, {}).subscribe({ error: () => undefined });
    controller
      .expectOne(`${API}/auth/change-password`)
      .flush({ message: 'Current password is incorrect' }, { status: 401, statusText: 'x' });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not sign anyone out for mistyping the password that confirms deletion', async () => {
    await router.navigate(['/profile']);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.delete(`${API}/account`).subscribe({ error: () => undefined });
    controller
      .expectOne(`${API}/account`)
      .flush({ message: 'That password is not correct' }, { status: 401, statusText: 'x' });

    expect(navigate).not.toHaveBeenCalled();
  });

  // The exemption above is an exact match, so the rest of the account API is
  // still ordinary session-protected data.
  it('still redirects when a real session lapse hits an account screen', async () => {
    await router.navigate(['/profile']);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get(`${API}/account/profile`).subscribe({ error: () => undefined });
    controller
      .expectOne(`${API}/account/profile`)
      .flush({ message: 'Authentication required' }, { status: 401, statusText: 'x' });

    expect(navigate).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('leaves a 403 alone — the session is fine, the account simply may not', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    let caught: unknown;

    http.post(`${API}/orders`, {}).subscribe({ error: (e: unknown) => (caught = e) });
    controller
      .expectOne(`${API}/orders`)
      .flush({ message: 'Missing permission: orders.write' }, { status: 403, statusText: 'x' });

    expect(navigate).not.toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBe(false); // never was, and not changed by the 403
    expect(caught).toBeDefined();
  });
});
