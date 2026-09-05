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
  template: `
    <footer class="footer">
      <div class="container">
        <div class="top">
          <div class="brand">
            <app-logo class="light" />
            <ul class="contacts">
              <li><app-icon [name]="'phone'" [size]="24" /><a href="tel:+17045550127">(704) 555-0127</a></li>
              <li><app-icon [name]="'mail'" [size]="24" /><a href="mailto:krist&#64;example.com">krist&#64;example.com</a></li>
              <li>
                <app-icon [name]="'pin'" [size]="24" />
                <span>3891 Ranchview Dr. Richardson,<br />California 62639</span>
              </li>
            </ul>
          </div>

          @for (col of columns; track col.titleKey) {
            <nav class="col" [attr.aria-label]="col.titleKey | t">
              <h2 class="col__title">{{ col.titleKey | t }}</h2>
              <ul>
                @for (link of col.links; track link.key) {
                  <li><a [routerLink]="link.route">{{ link.key | t }}</a></li>
                }
              </ul>
            </nav>
          }

          <div class="col subscribe">
            <h2 class="col__title">{{ 'footer.subscribe' | t }}</h2>
            <p>{{ 'footer.subscribeText' | t }}</p>
            <form class="sub" (submit)="$event.preventDefault()">
              <app-icon [name]="'mail'" [size]="24" />
              <input type="email" [placeholder]="'footer.emailPlaceholder' | t"
                     [attr.aria-label]="'footer.emailLabel' | t" />
              <button type="submit" [attr.aria-label]="'footer.subscribeAction' | t">
                <app-icon [name]="'arrow-right'" [size]="24" />
              </button>
            </form>
          </div>
        </div>

        <hr />

        <div class="bottom">
          <ul class="pay">
            @for (brand of payments; track brand) {
              <li><app-payment-mark [brand]="brand" /></li>
            }
          </ul>
          <p class="copy">{{ 'footer.rights' | t }}</p>
          <ul class="social">
            <li><a href="#" aria-label="Facebook"><app-icon [name]="'facebook'" [size]="24" /></a></li>
            <li><a href="#" aria-label="Instagram"><app-icon [name]="'instagram'" [size]="24" /></a></li>
            <li><a href="#" aria-label="Twitter"><app-icon [name]="'twitter'" [size]="24" /></a></li>
          </ul>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly columns = FOOTER_LINKS;
  protected readonly payments: PaymentBrand[] = ['visa', 'mastercard', 'gpay', 'amex', 'paypal'];
}
