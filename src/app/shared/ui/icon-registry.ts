import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal, Signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface IconModel {
  /** The name templates use: `<app-icon [name]="'arrow-left'" />`. */
  readonly name: string;
  /** File under `public/svg/` when it differs from the name. */
  readonly file?: string;
  /** Appended as `?ver=`, to break the browser cache when a glyph is redrawn. */
  readonly version?: string;
}

/**
 * The registered set. `as const` is what gives `IconName` its union, so a typo
 * in a template fails the build and there is one list to keep in step with the
 * files on disk.
 */
export const ICONS = [
  { name: 'search' },
  { name: 'heart' },
  { name: 'heart-filled' },
  { name: 'bag' },
  { name: 'user' },
  { name: 'box' },
  { name: 'pin' },
  { name: 'card' },
  { name: 'bell' },
  { name: 'settings' },
  { name: 'phone' },
  { name: 'mail' },
  { name: 'star' },
  { name: 'star-filled' },
  { name: 'trash' },
  { name: 'edit' },
  { name: 'chevron-down' },
  { name: 'chevron-right' },
  { name: 'chevron-left' },
  { name: 'arrow-right' },
  { name: 'arrow-left' },
  { name: 'plus' },
  { name: 'minus' },
  { name: 'grid' },
  { name: 'list' },
  { name: 'eye' },
  { name: 'compare' },
  { name: 'check' },
  { name: 'close' },
  { name: 'menu' },
  { name: 'home' },
  { name: 'clipboard' },
  { name: 'headphones' },
  { name: 'dollar' },
  { name: 'facebook' },
  { name: 'instagram' },
  { name: 'twitter' },
  { name: 'camera' },
  { name: 'filter' },
  { name: 'sliders' },
  { name: 'lock' },
  { name: 'box-check' },
  { name: 'logout' },
] as const satisfies readonly IconModel[];

export type IconName = (typeof ICONS)[number]['name'];

/** Where the files live, relative to the served root. */
const ICON_PATH = 'svg';

/**
 * Loads icons from `public/svg/*.svg` and hands each one back as a signal.
 *
 * One request per icon for the life of the app, however many places ask for
 * it: the signal is created on the first request, cached under the name, and
 * every later caller gets the same one. On a server there is nothing to fetch,
 * so the signal simply stays empty and the box keeps its reserved size.
 */
@Injectable({ providedIn: 'root' })
export class IconRegistry {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly byName = new Map<string, IconModel>(ICONS.map((icon) => [icon.name, icon]));
  private readonly cache = new Map<string, Signal<SafeHtml | null>>();

  get(name: IconName): Signal<SafeHtml | null> {
    const cached = this.cache.get(name);
    if (cached) return cached;

    const slot = signal<SafeHtml | null>(null);
    this.cache.set(name, slot);

    const icon = this.byName.get(name);
    if (!icon) {
      console.error(`IconRegistry: "${name}" is not registered — add it to ICONS.`);
      return slot;
    }

    if (this.isBrowser) {
      this.http.get(this.url(icon), { responseType: 'text' }).subscribe({
        // the files are our own bundled assets, so the markup is trusted by
        // definition — nothing user-supplied ever reaches this
        next: (svg) => slot.set(this.sanitizer.bypassSecurityTrustHtml(svg)),
        error: () => console.error(`IconRegistry: could not load "${name}".`),
      });
    }

    return slot;
  }

  /** Exposed for tests and for anything that wants to preload. */
  url(icon: IconModel): string {
    const file = icon.file ?? icon.name;
    return `${ICON_PATH}/${file}.svg${icon.version ? `?ver=${icon.version}` : ''}`;
  }
}
