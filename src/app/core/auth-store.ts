import { computed, Injectable } from '@angular/core';
import { persistentSignal } from './storage';

export interface Session {
  readonly email: string;
}

/**
 * Who is signed in, persisted so a reload does not drop the session.
 *
 * There is no backend, so this only records *that* someone signed in — any
 * well-formed credentials are accepted. Swap `signIn` for the real call and
 * everything that reads `isAuthenticated` keeps working unchanged.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly session = persistentSignal<Session | null>('krist.session', null);

  readonly user = this.session.asReadonly();
  readonly isAuthenticated = computed(() => this.session() !== null);

  signIn(email: string): void {
    this.session.set({ email });
  }

  signOut(): void {
    this.session.set(null);
  }
}
