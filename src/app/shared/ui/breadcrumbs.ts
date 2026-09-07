import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { Icon } from './icon';

export interface Crumb {
  label: string;
  link?: string;
  /** Carried with the link, so a crumb can point at a filtered shop. */
  queryParams?: Params;
}

@Component({
  selector: 'app-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  styleUrl: './breadcrumbs.scss',
  templateUrl: './breadcrumbs.html',
})
export class Breadcrumbs {
  readonly items = input.required<Crumb[]>();
}
