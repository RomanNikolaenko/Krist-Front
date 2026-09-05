import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { IconName, IconRegistry } from './icon-registry';

export type { IconName } from './icon-registry';

/**
 * Renders one registered icon. The markup comes from `public/svg/` through
 * `IconRegistry`, so the set is a folder of files rather than a switch in this
 * component, and adding a glyph never touches the bundle.
 *
 * Encapsulation is off on purpose: injected markup carries no scope attribute,
 * so a scoped `svg { … }` rule would never match it. Every selector here is
 * prefixed with `.app-icon`, which keeps the reach as tight as scoping would.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // size() is authored in px for readability but emitted as rem, so icons
  // scale with the root font size like everything else
  host: {
    class: 'app-icon',
    '[style.--icon-size.rem]': 'size() / 16',
    '[innerHTML]': 'svg()',
  },
  styleUrl: './icon.scss',
  template: '',
})
export class Icon {
  private readonly registry = inject(IconRegistry);

  readonly name = input.required<IconName>();
  readonly size = input(20);

  protected readonly svg = computed(() => this.registry.get(this.name())());
}
