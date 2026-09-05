import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../core/models';
import { CITIES, STATES } from '../../core/data/content';
import { Select, SelectOption } from './select';
import { T } from '../t.pipe';

export type AddressDraft = Omit<Address, 'id'>;

@Component({
  selector: 'app-address-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Select, T],
  styles: `
    form { display: flex; flex-direction: column; gap: 1.125rem; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.125rem; }
    .actions { display: flex; gap: 1rem; margin-top: 0.375rem; }
    .actions .btn { flex: 1; }
    @container page (max-width: 32rem) { .pair { grid-template-columns: 1fr; } }
  `,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label class="field">
        <span class="field__label">{{ 'form.name' | t }}</span>
        <input class="control" type="text" formControlName="name" [placeholder]="'form.namePlaceholder' | t"
               [class.is-invalid]="invalid('name')" />
        @if (invalid('name')) { <span class="field__error">{{ 'form.nameRequired' | t }}</span> }
      </label>

      <label class="field">
        <span class="field__label">{{ 'form.mobile' | t }}</span>
        <input class="control" type="tel" formControlName="phone" [placeholder]="'form.mobilePlaceholder' | t"
               [class.is-invalid]="invalid('phone')" />
        @if (invalid('phone')) { <span class="field__error">{{ 'form.mobileInvalid' | t }}</span> }
      </label>

      <label class="field">
        <span class="field__label">{{ 'form.flat' | t }}</span>
        <input class="control" type="text" formControlName="line1" [class.is-invalid]="invalid('line1')" />
        @if (invalid('line1')) { <span class="field__error">{{ 'form.required' | t }}</span> }
      </label>

      <label class="field">
        <span class="field__label">{{ 'form.area' | t }}</span>
        <input class="control" type="text" formControlName="area" [class.is-invalid]="invalid('area')" />
        @if (invalid('area')) { <span class="field__error">{{ 'form.required' | t }}</span> }
      </label>

      <div class="field">
        <span class="field__label">{{ 'form.city' | t }}</span>
        <app-select variant="field" formControlName="city" [options]="cityOptions"
                    [placeholder]="'form.selectCity' | t" [ariaLabel]="'form.city' | t"
                    [class.is-invalid]="invalid('city')" />
        @if (invalid('city')) { <span class="field__error">{{ 'form.cityRequired' | t }}</span> }
      </div>

      <label class="field">
        <span class="field__label">{{ 'form.pin' | t }}</span>
        <input class="control" type="text" formControlName="pin" [placeholder]="'form.pinPlaceholder' | t"
               [class.is-invalid]="invalid('pin')" />
        @if (invalid('pin')) { <span class="field__error">{{ 'form.pinInvalid' | t }}</span> }
      </label>

      <div class="field">
        <span class="field__label">{{ 'form.state' | t }}</span>
        <app-select variant="field" formControlName="state" [options]="stateOptions"
                    [placeholder]="'form.selectState' | t" [ariaLabel]="'form.state' | t"
                    [class.is-invalid]="invalid('state')" />
        @if (invalid('state')) { <span class="field__error">{{ 'form.stateRequired' | t }}</span> }
      </div>

      <label class="check">
        <input type="checkbox" formControlName="isDefault" />
        <span>{{ 'form.default' | t }}</span>
      </label>

      <div class="actions">
        @if (showCancel()) {
          <button type="button" class="btn btn--ghost" (click)="cancelled.emit()">{{ 'form.cancel' | t }}</button>
        }
        <button type="submit" class="btn btn--primary">{{ submitLabel() | t }}</button>
      </div>
    </form>
  `,
})
export class AddressForm {
  private readonly fb = inject(FormBuilder);

  readonly value = input<Address | null>(null);
  readonly submitLabel = input('form.addNewAddress');
  readonly showCancel = input(false);
  readonly saved = output<AddressDraft>();
  readonly cancelled = output<void>();

  protected readonly cityOptions: SelectOption[] = CITIES.map((c) => ({ value: c, label: c }));
  protected readonly stateOptions: SelectOption[] = STATES.map((s) => ({ value: s, label: s }));

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
    effect(() => {
      const address = this.value();
      if (address) {
        const { id, ...rest } = address;
        this.form.patchValue(rest);
      }
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
