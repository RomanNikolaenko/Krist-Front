import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountStore } from '../../core/account-store';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-personal-information',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, T],
  styleUrl: './personal-information.scss',
  templateUrl: './personal-information.html',
})
export class PersonalInformation {
  protected readonly account = inject(AccountStore);
  private readonly fb = inject(FormBuilder);

  protected readonly editing = signal(false);
  protected readonly savedAt = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.account.profile().firstName, Validators.required],
    lastName: [this.account.profile().lastName, Validators.required],
    phone: [
      this.account.profile().phone,
      [Validators.required, Validators.pattern(/^[\d\s()+-]{7,}$/)],
    ],
    email: [this.account.profile().email, [Validators.required, Validators.email]],
    address: [this.account.profile().address],
  });

  constructor() {
    this.form.disable();
  }

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected toggleEdit(): void {
    if (!this.editing()) {
      this.form.enable();
      this.editing.set(true);
      this.savedAt.set(false);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.account.updateProfile(this.form.getRawValue());
    this.form.disable();
    this.editing.set(false);
    this.savedAt.set(true);
  }
}
