import { Injectable } from '@angular/core';

/**
 * More than one overlay locks the page scroll — the site drawer and the profile
 * sidenav — and they can be open at the same time. Holders are counted rather
 * than toggled, so the class only comes off once the last one has let go.
 *
 * `toggle` is idempotent, which makes it safe to call from an effect.
 */
@Injectable({ providedIn: 'root' })
export class ScrollLock {
  private readonly holders = new Set<object>();

  toggle(holder: object, locked: boolean): void {
    if (locked) this.holders.add(holder);
    else this.holders.delete(holder);

    document.body.classList.toggle('is-locked', this.holders.size > 0);
  }
}
