import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly status: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export interface AuthSession {
  readonly id: string;
  readonly current: boolean;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: string;
  readonly lastUsedAt: string;
  readonly expiresAt: string;
}

interface MeResponse {
  authenticated: boolean;
  user?: AuthUser;
}

/**
 * Three states, not two.
 *
 * `unknown` is the one people leave out, and it is the reason apps flash the
 * login screen for a moment on every reload: the app cannot tell "nobody is
 * signed in" from "we have not asked yet". Everything that decides what to
 * render waits for `resolved()` first.
 *
 * The browser holds no token. The session lives in an HttpOnly cookie this
 * code cannot read, and the only reason it knows anything is that the server
 * answered `/auth/me`.
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);

  private readonly state = signal<AuthStatus>('unknown');
  private readonly currentUser = signal<AuthUser | null>(null);

  readonly status = this.state.asReadonly();
  readonly user = this.currentUser.asReadonly();

  readonly isAuthenticated = computed(() => this.state() === 'authenticated');
  /** True once the first `/auth/me` has come back, either way. */
  readonly resolved = computed(() => this.state() !== 'unknown');

  readonly fullName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  });

  /**
   * Asks the server who we are. Runs once at startup and again after anything
   * that could have changed the answer.
   *
   * A failure is treated as "not signed in" rather than propagated: the app
   * has to render something, and the alternative is a blank screen whenever
   * the API is briefly unreachable.
   */
  async refresh(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<MeResponse>(`${this.api}/auth/me`));
      this.apply(response);
    } catch {
      this.state.set('unauthenticated');
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<MeResponse>(`${this.api}/auth/login`, { email, password }),
    );
    this.apply(response);
  }

  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${this.api}/auth/register`, input));
  }

  /**
   * Best-effort, and deliberately does not rethrow.
   *
   * Local state clears either way: if the call failed the cookie may still be
   * live, but a UI claiming a session it cannot use is worse. And the caller
   * navigates away immediately after — throwing here would strand the user on
   * a page they believe they have already left.
   */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.api}/auth/logout`, {}));
    } catch {
      // the session is gone locally regardless
    } finally {
      this.clear();
    }
  }

  async logoutEverywhere(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.api}/auth/logout-all`, {}));
    } catch {
      // same reasoning as logout()
    } finally {
      this.clear();
    }
  }

  // ------------------------------------------------------------ account flows

  forgotPassword(email: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.api}/auth/forgot-password`, { email }),
    );
  }

  resetPassword(token: string, password: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.api}/auth/reset-password`, { token, password }),
    );
  }

  verifyEmail(token: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.api}/auth/verify-email`, { token }),
    );
  }

  resendVerification(email: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.api}/auth/resend-verification`, { email }),
    );
  }

  /**
   * Changing the password ends every other session and re-issues this one, so
   * the answer to "who am I" can have changed by the time it returns.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const result = await firstValueFrom(
      this.http.post<{ message: string }>(`${this.api}/auth/change-password`, {
        currentPassword,
        newPassword,
      }),
    );
    await this.refresh();
    return result;
  }

  sessions(): Promise<AuthSession[]> {
    return firstValueFrom(this.http.get<AuthSession[]>(`${this.api}/auth/sessions`));
  }

  async revokeSession(id: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.delete<{ authenticated: boolean }>(`${this.api}/auth/sessions/${id}`),
    );
    // Revoking the session you are sitting on is a logout.
    if (!result.authenticated) this.clear();
  }

  // ---------------------------------------------------------------- helpers

  /** Authorization in the UI is a convenience; the API enforces it regardless. */
  has(permission: string): boolean {
    return this.currentUser()?.permissions.includes(permission) ?? false;
  }

  is(role: string): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  /** Called by the interceptor when the server says the session is gone. */
  clear(): void {
    this.state.set('unauthenticated');
    this.currentUser.set(null);
  }

  private apply(response: MeResponse): void {
    if (response.authenticated && response.user) {
      this.currentUser.set(response.user);
      this.state.set('authenticated');
    } else {
      this.clear();
    }
  }
}
