import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/cart-store';
import { Icon } from '../../shared/ui/icon';
import { QtyStepper } from '../../shared/ui/qty-stepper';
import { OrderSummary } from '../../shared/ui/order-summary';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, Icon, QtyStepper, OrderSummary, T],
  styleUrl: './cart.scss',
  templateUrl: './cart.html',
})
export class Cart {
  protected readonly cart = inject(CartStore);
}
