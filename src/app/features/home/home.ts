import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Catalog } from '../../core/catalog';
import { HOME_CATEGORIES, INSTAGRAM_STORIES, TESTIMONIALS } from '../../core/data/content';
import { Icon } from '../../shared/ui/icon';
import { ProductCard } from '../../shared/ui/product-card';
import { StarRating } from '../../shared/ui/star-rating';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { Carousel, CarouselBreakpoints } from '../../shared/ui/carousel';
import { T } from '../../shared/t.pipe';

interface Countdown {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

/** The kit shows a fixed 120d 18h 15m 10s offer — we count down from that. */
const OFFER_MS = ((120 * 24 + 18) * 60 + 15) * 60_000 + 10_000;

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterLink, Icon, ProductCard, StarRating, FeatureStrip, Carousel, T],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly catalog = inject(Catalog);

  protected readonly categories = HOME_CATEGORIES;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly stories = INSTAGRAM_STORIES;
  protected readonly bestsellers = this.catalog.bestsellers(8);

  // optional: the arrows render before the carousel exists on the first pass
  protected readonly categoryRail = viewChild<Carousel>('catRailEl');
  protected readonly quoteRail = viewChild<Carousel>('quoteRailEl');

  protected readonly categoryBreakpoints: CarouselBreakpoints = {
    600: { slidesPerView: 2 },
    900: { slidesPerView: 3 },
    1200: { slidesPerView: 4 },
  };

  protected readonly quoteBreakpoints: CarouselBreakpoints = {
    600: { slidesPerView: 2 },
    1000: { slidesPerView: 3 },
  };

  protected readonly countdown = signal<Countdown>(split(OFFER_MS));

  constructor() {
    const deadline = Date.now() + OFFER_MS;
    const timer = setInterval(() => {
      this.countdown.set(split(Math.max(0, deadline - Date.now())));
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected pad(n: number): string {
    return n < 10 ? `0${n}` : String(n);
  }
}

function split(ms: number): Countdown {
  const secs = Math.floor(ms / 1000);
  return {
    days: Math.floor(secs / 86_400),
    hours: Math.floor((secs % 86_400) / 3600),
    mins: Math.floor((secs % 3600) / 60),
    secs: secs % 60,
  };
}
