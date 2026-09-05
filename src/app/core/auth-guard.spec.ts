import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { authGuard } from './auth-guard';
import { AuthStore } from './auth-store';

function run(url: string) {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
  let auth: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    auth = TestBed.inject(AuthStore);
  });

  it('lets a signed-in visitor through', () => {
    auth.signIn('robertfox@example.com');
    expect(run('/profile/orders')).toBe(true);
  });

  it('sends a guest to the login screen', () => {
    const result = run('/profile/orders');
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toContain('/login');
  });

  it('carries the attempted url so the trip resumes after signing in', () => {
    const result = run('/profile/cards') as UrlTree;
    expect(result.queryParams['returnUrl']).toBe('/profile/cards');
  });

  it('blocks again once the session ends', () => {
    auth.signIn('robertfox@example.com');
    expect(run('/profile')).toBe(true);

    auth.signOut();
    expect(run('/profile')).toBeInstanceOf(UrlTree);
  });
});

describe('AuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts signed out', () => {
    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(false);
  });

  it('records the email it was given', () => {
    const auth = TestBed.inject(AuthStore);
    auth.signIn('a@b.com');

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()?.email).toBe('a@b.com');
  });

  it('clears the session on sign out', () => {
    const auth = TestBed.inject(AuthStore);
    auth.signIn('a@b.com');
    auth.signOut();

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.user()).toBeNull();
  });
});
