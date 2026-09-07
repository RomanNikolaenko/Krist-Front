import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from './icon';

/**
 * A titled section that opens and shuts.
 *
 * Open state stays with the caller rather than living in here, because the
 * screens that use this decide it together: a filter sidebar remembers which
 * groups were open across a reload, and a menu closes its siblings when one
 * opens. A component that owned its own flag could do neither.
 *
 * The heading carries the button rather than the button carrying the heading,
 * so the section keeps its place in the document outline instead of hiding a
 * chunk of the page behind a control with no name.
 */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, Icon],
  styleUrl: './accordion.scss',
  templateUrl: './accordion.html',
})
export class Accordion {
  readonly title = input.required<string>();
  readonly open = input(false);
  /** The heading level this section sits at in the page outline. */
  readonly headingLevel = input<2 | 3>(2);

  readonly toggled = output<void>();
}
