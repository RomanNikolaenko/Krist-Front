import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';

export interface Crumb {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  styles: `
    nav { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: var(--fs-sm); }
    a { color: var(--c-heading); &:hover { color: var(--c-ink); text-decoration: underline; } }
    .sep { color: var(--c-muted); display: inline-flex; }
    .current { color: var(--c-muted); }
  `,
  template: `
    <nav aria-label="Breadcrumb">
      @for (crumb of items(); track crumb.label; let last = $last) {
        @if (crumb.link && !last) {
          <a [routerLink]="crumb.link">{{ crumb.label }}</a>
        } @else {
          <span class="current">{{ crumb.label }}</span>
        }
        @if (!last) { <span class="sep"><app-icon [name]="'chevron-right'" [size]="20" /></span> }
      }
    </nav>
  `,
})
export class Breadcrumbs {
  readonly items = input.required<Crumb[]>();
}
