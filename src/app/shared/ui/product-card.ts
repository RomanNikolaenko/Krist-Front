import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { CartStore } from '../../core/cart-store';
import { WishlistStore } from '../../core/wishlist-store';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, Icon, T],
  host: { '[class.card--list]': "layout() === 'list'" },
  styles: `
    /*
     * The card is a subgrid spanning four rows of its parent grid, so the brand,
     * name and price lines share a baseline across a row however long a single
     * title runs.
     */
    :host {
      display: grid;
      grid-row: span 4;
      grid-template-rows: subgrid;
      row-gap: 0;
      align-content: start;
    }

    .card__media { position: relative; }

    .card__plate {
      position: relative;
      display: block;
      /* width is pinned so the height ceiling crops the photo instead of
         shrinking the plate to keep the ratio */
      width: 100%;
      aspect-ratio: 3 / 3.7;
      max-height: 22rem;
      overflow: hidden;
      background: var(--c-surface);
    }

    .card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .5s ease;
    }

    .card__tools {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .card__tool {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border: none;
      border-radius: 50%;
      background: var(--c-panel);
      color: var(--c-heading);
      box-shadow: 0 0.125rem 0.5rem rgba(60, 66, 66, .18);
      transition: background .16s ease, color .16s ease, transform .16s ease;

      &:hover { background: var(--c-ink); color: var(--c-on-ink); }
      &:active { transform: scale(.92); }
      &:focus-visible { outline: 0.125rem solid var(--c-ink); outline-offset: 0.125rem; }
      &--on { color: var(--c-danger); }
      &--danger:hover { background: var(--c-danger); color: var(--c-fixed-white); }
    }

    .card__cta {
      padding: 0.75rem;
      border: 0.0625rem solid var(--c-line-strong);
      border-radius: var(--r-sm);
      background: var(--c-panel);
      color: var(--c-heading);
      font-size: var(--fs-sm);
      transition: background .18s ease, color .18s ease, opacity .2s ease, transform .2s ease;

      &:hover { background: var(--c-ink); border-color: var(--c-ink); color: var(--c-on-ink); }
      &:focus-visible { outline: 0.125rem solid var(--c-ink); outline-offset: 0.125rem; }
    }

    .card__brand {
      margin-top: 0.875rem;
      font-size: var(--fs-sm);
      font-weight: 600;
      color: var(--c-heading);
    }

    .card__name {
      font-size: var(--fs-sm);
      color: var(--c-body);
      text-wrap: balance;
    }

    .card__prices {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .card__price { font-size: var(--fs-sm); font-weight: 600; color: var(--c-heading); }
    .card__old { font-size: var(--fs-sm); text-decoration: line-through; color: var(--c-muted); }

    /*
     * Pointer devices get the kit's reveal-on-hover treatment. Touch cannot
     * hover — and a tap on the card navigates — so there the actions stay on
     * screen and the cart button is a real button under the image.
     */
    @media (hover: hover) and (pointer: fine) {
      .card__tools {
        opacity: 0;
        transform: translateX(0.375rem);
        transition: opacity .2s ease, transform .2s ease;
      }

      :host(:hover) .card__tools,
      .card__tools:focus-within { opacity: 1; transform: none; }

      :host(:hover) .card__image { transform: scale(1.04); }

      :host(:not(.card--list)) .card__cta {
        position: absolute;
        left: 1.25rem;
        right: 1.25rem;
        bottom: 1.125rem;
        border-color: transparent;
        opacity: 0;
        transform: translateY(0.5rem);
      }

      :host(:not(.card--list):hover) .card__cta,
      :host(:not(.card--list)) .card__cta:focus-visible { opacity: 1; transform: none; }

      :host(.card--list) .card__cta { align-self: start; width: max-content; margin-top: 0.5rem; }
    }

    @media (hover: none), (pointer: coarse) {
      .card__cta { width: 100%; margin-top: 0.75rem; }
    }

    /*
     * Narrow columns keep the copy under the image — only the plate gets
     * shorter so a one-per-row card stays a card, not a poster.
     */
    @container page (max-width: 27rem) {
      .card__plate { max-height: 15rem; }
      .card__tool { width: 3rem; height: 3rem; }
    }

    @container panel (max-width: 27rem) {
      .card__plate { max-height: 15rem; }
    }

    /* list view: plate beside the copy */
    :host(.card--list) {
      display: grid;
      grid-row: auto;
      grid-template-rows: none;
      grid-template-columns: 13.125rem minmax(0, 1fr);
      gap: 1.625rem;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 0.0625rem solid var(--c-line);
    }

    :host(.card--list) .card__plate { aspect-ratio: 1 / 1.15; }
    :host(.card--list) .card__info { display: flex; flex-direction: column; gap: 0.375rem; }
    :host(.card--list) .card__brand { margin-top: 0; }
    :host(.card--list) .card__brand,
    :host(.card--list) .card__name,
    :host(.card--list) .card__price,
    :host(.card--list) .card__old { font-size: var(--fs-body); }

    @container page (max-width: 30rem) {
      :host(.card--list) { grid-template-columns: 8rem minmax(0, 1fr); gap: 1rem; }
    }
  `,
  template: `
    <div class="card__media">
      <!--
        The image is the whole of this link, so the link carries the name and
        the image stays decorative — an alt as well would read the product
        twice over. Every control below names its product too: a row of cards
        otherwise gives a screen reader five identical "Quick view" links.
      -->
      <a class="card__plate" [routerLink]="['/product', product().slug]"
         [attr.aria-label]="product().name">
        <img class="card__image" [src]="product().images[0]" alt="" width="700" height="860" loading="lazy" />
      </a>

      <div class="card__tools">
        @if (variant() === 'wishlist') {
          <button type="button" class="card__tool card__tool--danger" (click)="remove.emit(product().id)"
                  [attr.aria-label]="'card.removeWishlist' | t: { name: product().name }">
            <app-icon [name]="'trash'" [size]="24" />
          </button>
        } @else {
          <button type="button" class="card__tool" [class.card__tool--on]="wishlist.has(product().id)"
                  (click)="wishlist.toggle(product().id)"
                  [attr.aria-label]="'card.wishlistToggle' | t: { name: product().name }">
            <app-icon [name]="wishlist.has(product().id) ? 'heart-filled' : 'heart'" [size]="24" />
          </button>
          <button type="button" class="card__tool"
                  [attr.aria-label]="'card.compare' | t: { name: product().name }">
            <app-icon [name]="'compare'" [size]="24" />
          </button>
          <a class="card__tool" [routerLink]="['/product', product().slug]"
             [attr.aria-label]="'card.quickView' | t: { name: product().name }">
            <app-icon [name]="'eye'" [size]="24" />
          </a>
        }
      </div>

      @if (layout() === 'grid') {
        <button type="button" class="card__cta" (click)="addToCart()">
          {{ (variant() === 'wishlist' ? 'card.moveToCart' : 'card.addToCart') | t }}
        </button>
      }
    </div>

    @if (layout() === 'list') {
      <div class="card__info">
        <span class="card__brand">{{ product().brand }}</span>
        <a class="card__name" [routerLink]="['/product', product().slug]">{{ product().name }}</a>
        <span class="card__prices">
          <span class="card__price">{{ product().price | currency: 'USD' }}</span>
          @if (product().oldPrice > product().price) {
            <span class="card__old">{{ product().oldPrice | currency: 'USD' }}</span>
          }
        </span>
        <button type="button" class="card__cta" (click)="addToCart()">
          {{ (variant() === 'wishlist' ? 'card.moveToCart' : 'card.addToCart') | t }}
        </button>
      </div>
    } @else {
      <span class="card__brand">{{ product().brand }}</span>
      <a class="card__name" [routerLink]="['/product', product().slug]">{{ product().name }}</a>
      <span class="card__prices">
        <span class="card__price">{{ product().price | currency: 'USD' }}</span>
        @if (product().oldPrice > product().price) {
          <span class="card__old">{{ product().oldPrice | currency: 'USD' }}</span>
        }
      </span>
    }
  `,
})
export class ProductCard {
  protected readonly wishlist = inject(WishlistStore);
  private readonly cart = inject(CartStore);

  readonly product = input.required<Product>();
  readonly variant = input<'grid' | 'wishlist'>('grid');
  readonly layout = input<'grid' | 'list'>('grid');
  readonly remove = output<number>();

  protected addToCart(): void {
    const p = this.product();
    this.cart.add(p, p.sizes[0], p.colors[0] ?? null, 1);
    if (this.variant() === 'wishlist') this.remove.emit(p.id);
  }
}
