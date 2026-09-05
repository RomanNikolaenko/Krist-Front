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
  styles: `
    /*
     * inline-flex + a zero line box keeps the glyph exactly on the element box,
     * so a flex row with align-items:center lands it on the text's optical
     * centre. vertical-align:middle covers the inline contexts, and flex:none
     * stops a long label from squashing it. The box is sized here rather than
     * on the svg, so it holds its place while the file is still in flight.
     */
    .app-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: var(--icon-size, 1.25rem);
      height: var(--icon-size, 1.25rem);
      line-height: 0;
      vertical-align: middle;
    }

    .app-icon svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  template: '',
})
export class Icon {
  private readonly registry = inject(IconRegistry);

  readonly name = input.required<IconName>();
  readonly size = input(20);

  protected readonly svg = computed(() => this.registry.get(this.name())());
}
