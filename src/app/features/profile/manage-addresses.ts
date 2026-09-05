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
  styleUrl: './manage-addresses.scss',
  templateUrl: './manage-addresses.html',
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
