import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../core/models';
import { T } from '../t.pipe';

export type AddressDraft = Omit<Address, 'id'>;

@Component({
  selector: 'app-address-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, T],
  styleUrl: './address-form.scss',
  templateUrl: './address-form.html',
})
export class AddressForm {
  private readonly fb = inject(FormBuilder);

  readonly value = input<Address | null>(null);
  readonly submitLabel = input('form.addNewAddress');
  readonly showCancel = input(false);
  readonly saved = output<AddressDraft>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()+-]{7,}$/)]],
    line1: ['', Validators.required],
    area: ['', Validators.required],
    city: ['', Validators.required],
    pin: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    state: ['', Validators.required],
    isDefault: [true],
  });

  constructor() {
    /*
     * The form follows whatever it was handed, including nothing.
     *
     * It is projected into a dialog, and projected content is built with its
     * parent and kept for as long as the parent lives — closing the dialog does
     * not destroy this. Without the reset, "add a new address" opened on the
     * last address somebody edited, filled in and ready to be saved as a second
     * copy of itself.
     */
    effect(() => {
      const address = this.value();

      if (!address) {
        this.form.reset({ isDefault: true });
        return;
      }

      const { id, ...rest } = address;
      this.form.patchValue(rest);
    });
  }

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
    this.form.reset({ isDefault: true });
  }
}
