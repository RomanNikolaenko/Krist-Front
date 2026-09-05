import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FEATURES } from '../../core/data/content';
import { Icon, IconName } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-feature-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styleUrl: './feature-strip.scss',
  templateUrl: './feature-strip.html',
})
export class FeatureStrip {
  protected readonly features = FEATURES as { icon: IconName; titleKey: string; textKey: string }[];
}
