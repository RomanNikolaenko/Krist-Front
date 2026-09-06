import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AccountStore } from '../../core/account-store';
import { AuthService } from '../../core/auth/auth.service';
import { ScrollLock } from '../../core/scroll-lock';
import { OrderStatus } from '../../core/models';
import { Icon, IconName } from '../../shared/ui/icon';
import { ProfileToolbar } from './profile-toolbar';
import { T } from '../../shared/t.pipe';

const NAV: { path: string; labelKey: string; icon: IconName }[] = [
  { path: 'personal-information', labelKey: 'profile.personal', icon: 'user' },
  { path: 'orders', labelKey: 'profile.orders', icon: 'box' },
  { path: 'wishlists', labelKey: 'profile.wishlists', icon: 'heart' },
  { path: 'addresses', labelKey: 'profile.addresses', icon: 'pin' },
  { path: 'cards', labelKey: 'profile.cards', icon: 'card' },
  { path: 'notifications', labelKey: 'profile.notifications', icon: 'bell' },
  { path: 'settings', labelKey: 'profile.settings', icon: 'settings' },
];

const STATUSES: OrderStatus[] = ['Delivered', 'In Process', 'Cancelled'];

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon, T],
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile {
  protected readonly account = inject(AccountStore);
  private readonly auth = inject(AuthService);
  protected readonly toolbar = inject(ProfileToolbar);
  private readonly router = inject(Router);

  protected readonly nav = NAV;
  protected readonly statuses = STATUSES;
  protected readonly filterOpen = signal(false);
  /** Narrow layouts collapse the rail behind a trigger; wide ones ignore this. */
  protected readonly sideOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Search + filter belong to the Orders screen only. */
  protected readonly showToolbar = computed(() => this.url().includes('/profile/orders'));

  constructor() {
    // in "over" mode the drawer sits on a backdrop, so the page behind it holds still
    const scrollLock = inject(ScrollLock);
    effect(() => scrollLock.toggle(this, this.sideOpen()));
  }

  protected async signOut(): Promise<void> {
    this.sideOpen.set(false);
    await this.auth.logout();
    await this.router.navigate(['/']);
  }

  protected onSearch(event: Event): void {
    this.toolbar.setSearch((event.target as HTMLInputElement).value);
  }

  /**
   * The backdrop handles dismissal inside the container; this covers the rest of
   * the page, which the container-scoped backdrop does not reach.
   */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.sideOpen() && !this.filterOpen()) return;

    const target = event.target as HTMLElement;
    if (!target.closest('.profile__side') && !target.closest('.profile__toggle')) {
      this.sideOpen.set(false);
    }
    if (!target.closest('.profile__filter')) this.filterOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.sideOpen.set(false);
    this.filterOpen.set(false);
  }
}
