import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { AuthService } from '../../core/auth/auth.service';
import { ScrollLock } from '../../core/scroll-lock';
import { Icon, IconName } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

const NAV: { path: string; labelKey: string; icon: IconName }[] = [
  { path: 'products', labelKey: 'admin.products', icon: 'box' },
  { path: 'orders', labelKey: 'admin.orders', icon: 'clipboard' },
  { path: 'taxonomy', labelKey: 'admin.taxonomy', icon: 'sliders' },
];

/** Below this the rail costs more room than the content can spare. */
const DRAWER_BELOW = '(width <= 86rem)';

/**
 * The catalogue screens, and deliberately nothing else.
 *
 * Its own shell rather than a section of the profile: the profile is somebody's
 * account — their orders, their cards, their addresses — and none of that has
 * anything to do with running the shop. Sharing the layout would have put a
 * wish list two clicks from the delete button.
 */
@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon, T],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly account = inject(AccountStore);
  protected readonly nav = NAV;

  protected readonly drawerOpen = signal(false);

  /**
   * Whether the rail is currently a drawer.
   *
   * Read from the same query the stylesheet uses rather than from a number
   * copied beside it, so the two cannot drift: `inert` has to come off at
   * exactly the width where the rail goes back to being part of the page.
   */
  private readonly isDrawer = signal(matchMedia(DRAWER_BELOW).matches);

  /** Shut and off-canvas, so nothing in it can be tabbed to. */
  protected readonly inert = computed(() => this.isDrawer() && !this.drawerOpen());

  constructor() {
    const query = matchMedia(DRAWER_BELOW);
    const sync = () => {
      this.isDrawer.set(query.matches);
      if (!query.matches) this.drawerOpen.set(false);
    };

    query.addEventListener('change', sync);

    // The page behind a drawer holds still; a rail in the flow does not lock it.
    const scrollLock = inject(ScrollLock);
    effect(() => scrollLock.toggle(this, this.isDrawer() && this.drawerOpen()));
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.drawerOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    this.drawerOpen.set(false);
    await this.auth.logout();
    await this.router.navigate(['/']);
  }
}
