import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AccountStore } from '../../core/account-store';
import { Address } from '../../core/models';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { AddressForm, AddressDraft } from '../../shared/ui/address-form';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-manage-addresses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Modal, AddressForm, T],
  styles: `
    :host { display: block; }

    .add { width: 100%; max-width: 20rem; margin-bottom: 1.625rem; }

    .row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1.5rem;
      padding-bottom: 1.375rem;
      margin-bottom: 1.375rem;
      border-bottom: 0.0625rem solid var(--c-line);
    }

    .name { font-size: 1.125rem; font-weight: 600; color: var(--c-heading); }
    .lines { font-size: var(--fs-sm); color: var(--c-body); margin: 0.5rem 0 0.625rem; }

    .phone { display: flex; align-items: center; gap: 0.625rem; font-size: var(--fs-sm); color: var(--c-heading); }
    .phone a { color: inherit; &:hover { text-decoration: underline; } }

    .row__actions { display: flex; flex-direction: column; gap: 0.625rem; align-items: stretch; }
    .row__actions .action { justify-content: center; }

    h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.375rem; }

    @container panel (max-width: 32rem) {
      .row { grid-template-columns: 1fr; }
      .row__actions { flex-direction: row; }
      .row__actions .action { flex: 1; }
    }
  `,
  template: `
    <button type="button" class="btn btn--primary add" (click)="open.set(true)">
      <app-icon [name]="'plus'" [size]="24" />
      {{ 'addr.addNew' | t }}
    </button>

    @for (address of account.addresses(); track address.id) {
      <div class="row">
        <div>
          <p class="name">{{ address.name }}</p>
          <p class="lines">{{ line(address) }}</p>
          <p class="phone">
            <app-icon [name]="'phone'" [size]="24" />
            <a [href]="'tel:' + address.phone.replace(dialSeparators, '')">{{ address.phone }}</a>
          </p>
        </div>

        <div class="row__actions">
          <button type="button" class="action" (click)="edit(address)">
            <app-icon [name]="'edit'" [size]="24" /> {{ 'addr.edit' | t }}
          </button>
          <button type="button" class="action action--danger" (click)="account.removeAddress(address.id)">
            <app-icon [name]="'trash'" [size]="24" /> {{ 'addr.delete' | t }}
          </button>
        </div>
      </div>
    }

    @if (!account.addresses().length) {
      <p class="muted">{{ 'addr.none' | t }}</p>
    }

    <app-modal [open]="open()" [label]="'addr.addTitle' | t" (closed)="close()">
      <h2>{{ (editing() ? 'addr.editTitle' : 'addr.addTitle') | t }}</h2>
      <app-address-form
        [value]="editing()"
        [showCancel]="true"
        [submitLabel]="editing() ? 'form.saveAddress' : 'form.addNewAddress'"
        (saved)="save($event)"
        (cancelled)="close()" />
    </app-modal>
  `,
})
export class ManageAddresses {
  protected readonly account = inject(AccountStore);
  protected readonly open = signal(false);
  protected readonly editing = signal<Address | null>(null);

  /** Strips spaces, dashes and brackets so the tel: target is dialable. */
  protected readonly dialSeparators = /[^d+]/g;

  protected line(a: Address): string {
    return `${a.line1} ${a.area}, ${a.state} ${a.pin}`;
  }

  protected edit(address: Address): void {
    this.editing.set(address);
    this.open.set(true);
  }

  protected save(draft: AddressDraft): void {
    const current = this.editing();
    if (current) {
      this.account.updateAddress(current.id, draft);
    } else {
      this.account.addAddress(draft);
    }
    this.close();
  }

  protected close(): void {
    this.open.set(false);
    this.editing.set(null);
  }
}
