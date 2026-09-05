import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NOTIFICATIONS } from '../../core/data/content';
import { NotificationIcon } from '../../core/models';
import { Icon, IconName } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styleUrl: './notifications.scss',
  templateUrl: './notifications.html',
})
export class Notifications {
  protected readonly notifications = NOTIFICATIONS;

  protected badgeIcon(icon: NotificationIcon): IconName {
    return icon === 'avatar' ? 'user' : icon;
  }
}
