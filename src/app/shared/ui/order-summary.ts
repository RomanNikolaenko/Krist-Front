import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../core/cart-store';
import { T } from '../t.pipe';

@Component({
  selector: 'app-order-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule, T],
  styleUrl: './order-summary.scss',
  templateUrl: './order-summary.html',
})
export class OrderSummary {
  protected readonly cart = inject(CartStore);
  protected code = this.cart.appliedCode() ?? '';
  protected readonly failed = signal(false);

  protected apply(): void {
    this.failed.set(!this.cart.applyCode(this.code));
  }
}
