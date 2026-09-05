import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Krist wordmark. The mark is a geometric stand-in for the kit's logo —
 * drop in the real SVG export to make it exact.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './logo.scss',
  templateUrl: './logo.html',
})
export class Logo {
  readonly label = input('Krist');
}
