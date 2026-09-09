import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactApi } from '../core/contact.api';
import { FOOTER_LINKS } from '../core/data/content';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/logo';
import { PaymentBrand, PaymentMark } from '../shared/ui/payment-mark';
import { apiMessage } from '../core/api-error';
import { I18n } from '../core/i18n/i18n';
import { T } from '../shared/t.pipe';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Logo, PaymentMark, T],
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  private readonly i18n = inject(I18n);
  private readonly api = inject(ContactApi);

  protected readonly columns = FOOTER_LINKS;
  protected readonly payments: PaymentBrand[] = ['visa', 'mastercard', 'gpay', 'amex', 'paypal'];

  protected readonly email = signal('');
  protected readonly sending = signal(false);
  protected readonly subscribed = signal(false);
  protected readonly error = signal<string | null>(null);

  /** The box promised to write to this address; now something records it. */
  protected async subscribe(): Promise<void> {
    const email = this.email().trim();
    if (!email || this.sending()) return;

    this.sending.set(true);
    this.error.set(null);

    try {
      await this.api.subscribe(email);
      this.subscribed.set(true);
    } catch (failure) {
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
    } finally {
      this.sending.set(false);
    }
  }
}
