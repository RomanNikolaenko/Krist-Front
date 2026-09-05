import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
import type { Swiper, SwiperOptions } from 'swiper/types';

/** Registers <swiper-container> / <swiper-slide> once for the whole app. */
register();

export type CarouselBreakpoints = NonNullable<SwiperOptions['breakpoints']>;

/** Swiper events after which the arrow state can differ. */
const STATE_EVENTS = [
  'slideChange',
  'reachBeginning',
  'reachEnd',
  'fromEdge',
  'resize',
  'breakpoint',
  'lock',
  'unlock',
  'update',
] as const;

/**
 * Thin wrapper around the Swiper web component. It exists so the two rails on
 * the home page share one configuration path and one pair of arrow buttons,
 * and so `register()` is called exactly once.
 *
 * `atStart` / `atEnd` / `scrollable` let the host disable or drop its arrows
 * rather than leaving dead controls on screen.
 */
@Component({
  selector: 'app-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    :host { display: block; }
    swiper-container { display: block; }
    swiper-slide { height: auto; }
  `,
  template: `
    <swiper-container #swiper init="false">
      <ng-content />
    </swiper-container>
  `,
})
export class Carousel {
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('swiper');
  private readonly destroyRef = inject(DestroyRef);

  readonly gap = input(24);
  readonly perView = input(1.15);
  readonly breakpoints = input<CarouselBreakpoints>({});

  private readonly instance = signal<Swiper | undefined>(undefined);
  private readonly beginning = signal(true);
  private readonly end = signal(false);
  private readonly locked = signal(true);

  readonly atStart = this.beginning.asReadonly();
  readonly atEnd = this.end.asReadonly();
  /** False while every slide already fits, so the arrows can be hidden. */
  readonly scrollable = computed(() => !this.locked());

  constructor() {
    afterNextRender(() => {
      const element = this.container().nativeElement as HTMLElement & {
        initialize: () => void;
        swiper: Swiper;
      };

      Object.assign(element, {
        slidesPerView: this.perView(),
        spaceBetween: this.gap(),
        breakpoints: this.breakpoints(),
        grabCursor: true,
        watchOverflow: true,
        keyboard: { enabled: true },
        a11y: { enabled: true },
      } satisfies SwiperOptions);

      element.initialize();

      const swiper = element.swiper;
      this.instance.set(swiper);

      const sync = () => {
        this.beginning.set(swiper.isBeginning);
        this.end.set(swiper.isEnd);
        this.locked.set(swiper.isLocked);
      };

      STATE_EVENTS.forEach((event) => swiper.on(event, sync));
      sync();

      this.destroyRef.onDestroy(() => swiper.destroy());
    });
  }

  next(): void {
    this.instance()?.slideNext();
  }

  prev(): void {
    this.instance()?.slidePrev();
  }
}
