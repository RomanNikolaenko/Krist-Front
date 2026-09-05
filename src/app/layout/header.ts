import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../core/auth-store';
import { CartStore } from '../core/cart-store';
import { ScrollLock } from '../core/scroll-lock';
import { WishlistStore } from '../core/wishlist-store';
import { MEGA_MENU } from '../core/data/content';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/logo';
import { T } from '../shared/t.pipe';

/** Grace period so moving the pointer from the trigger to the panel keeps it open. */
const CLOSE_DELAY = 160;

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, Logo, T],
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);

  protected readonly megaMenu = MEGA_MENU;

  /** The drawer shows one flat accordion; the columns only matter on desktop. */
  protected readonly menuGroups = computed(() => MEGA_MENU.flat());

  protected readonly shopOpen = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly searchOpen = signal(false);
  /** titleKey of the expanded drawer group, or null — one open at a time. */
  protected readonly openGroup = signal<string | null>(null);

  /** Only devices that can actually hover get hover-to-open. */
  private readonly canHover =
    globalThis.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;

  private closeTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // the drawer covers the page, so the page behind it must not scroll
    const scrollLock = inject(ScrollLock);
    effect(() => scrollLock.toggle(this, this.drawerOpen()));
    // focus from code rather than the autofocus attribute, which fires on load
    // and drags the reader somewhere they did not ask to go
    effect(() => {
      if (this.searchOpen()) this.searchInput()?.nativeElement.focus();
    });

    inject(DestroyRef).onDestroy(() => clearTimeout(this.closeTimer));
  }

  // ---------- mega menu ----------
  protected onShopEnter(): void {
    if (!this.canHover) return;
    clearTimeout(this.closeTimer);
    this.shopOpen.set(true);
    this.searchOpen.set(false);
  }

  /** Leaving the trigger or the panel closes it, unless the pointer lands on the other. */
  protected onShopLeave(): void {
    if (!this.canHover) return;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.shopOpen.set(false), CLOSE_DELAY);
  }

  /** Click still works — for touch, and for anyone who prefers it. */
  protected toggleShop(): void {
    clearTimeout(this.closeTimer);
    this.shopOpen.update((open) => !open);
  }

  protected toggleGroup(titleKey: string): void {
    this.openGroup.update((open) => (open === titleKey ? null : titleKey));
  }

  /** The drawer and the search field are alternatives, never both at once. */
  protected toggleDrawer(): void {
    const next = !this.drawerOpen();
    this.drawerOpen.set(next);
    if (next) this.searchOpen.set(false);
    else this.closeAll();
  }

  protected toggleSearch(): void {
    const next = !this.searchOpen();
    this.searchOpen.set(next);
    if (next) {
      this.drawerOpen.set(false);
      this.shopOpen.set(false);
      this.openGroup.set(null);
    }
  }

  protected closeAll(): void {
    clearTimeout(this.closeTimer);
    this.shopOpen.set(false);
    this.drawerOpen.set(false);
    this.searchOpen.set(false);
    this.openGroup.set(null);
  }

  /** A click outside the header dismisses whatever it had open. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.host.nativeElement.contains(event.target as Node)) return;
    if (this.searchOpen() || this.shopOpen()) {
      this.searchOpen.set(false);
      this.shopOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeAll();
  }
}
