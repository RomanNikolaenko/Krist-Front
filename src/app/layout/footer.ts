import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FOOTER_LINKS } from '../core/data/content';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/logo';
import { PaymentBrand, PaymentMark } from '../shared/ui/payment-mark';
import { T } from '../shared/t.pipe';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Logo, PaymentMark, T],
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly columns = FOOTER_LINKS;
  protected readonly payments: PaymentBrand[] = ['visa', 'mastercard', 'gpay', 'amex', 'paypal'];
}
