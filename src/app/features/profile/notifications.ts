import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccountStore } from '../../core/account-store';
import { NotificationKind } from '../../core/models';
import { Icon, IconName } from '../../shared/ui/icon';
import { D } from '../../shared/d.pipe';
import { T } from '../../shared/t.pipe';

/**
 * What each kind of event says, and which badge it wears.
 *
 * The server stores the event, not the sentence, so the wording stays here
 * where the translations are — a change of copy is not a migration.
 */
const COPY: Record<NotificationKind, { title: string; text: string; icon: IconName }> = {
  PROFILE_UPDATED: { title: 'notif.profileUpdate', text: 'notif.profileUpdateText', icon: 'user' },
  ORDER_PLACED: { title: 'notif.orderPlaced', text: 'notif.orderPlacedText', icon: 'box' },
  ORDER_DELIVERED: {
    title: 'notif.orderDelivered',
    text: 'notif.orderDeliveredText',
    icon: 'box-check',
  },
  REVIEW_POSTED: { title: 'notif.feedback', text: 'notif.feedbackText', icon: 'user' },
  PASSWORD_CHANGED: { title: 'notif.password', text: 'notif.passwordText', icon: 'lock' },
};

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [D, Icon, T],
  styleUrl: './notifications.scss',
  templateUrl: './notifications.html',
})
export class Notifications {
  protected readonly account = inject(AccountStore);

  protected title(kind: NotificationKind): string {
    return COPY[kind].title;
  }

  protected text(kind: NotificationKind): string {
    return COPY[kind].text;
  }

  protected icon(kind: NotificationKind): IconName {
    return COPY[kind].icon;
  }

  protected markAllRead(): void {
    void this.account.markAllNotificationsRead();
  }

  protected markRead(id: string): void {
    void this.account.markNotificationRead(id);
  }
}
