import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOG_POSTS } from '../../core/data/content';
import { Icon } from '../../shared/ui/icon';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-blog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, FeatureStrip, T],
  styleUrl: './blog.scss',
  templateUrl: './blog.html',
})
export class Blog {
  protected readonly posts = BLOG_POSTS;
}
