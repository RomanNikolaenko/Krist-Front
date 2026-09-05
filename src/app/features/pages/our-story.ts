import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STORY_STATS, STORY_VALUES } from '../../core/data/content';
import { Icon, IconName } from '../../shared/ui/icon';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-our-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, FeatureStrip, T],
  styleUrl: './our-story.scss',
  templateUrl: './our-story.html',
})
export class OurStory {
  protected readonly values = STORY_VALUES as { icon: IconName; titleKey: string; textKey: string }[];
  protected readonly stats = STORY_STATS;
}
