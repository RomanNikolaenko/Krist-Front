import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AuthLayout } from './auth-layout';
import { apiMessage } from '../../core/api-error';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, T],
  styleUrls: ['./auth.scss', './signup.scss'],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly i18n = inject(I18n);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
    terms: [true, Validators.requiredTrue],
  });

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const { email, password, firstName, lastName } = this.form.getRawValue();

    try {
      const result = await this.auth.register({ email, password, firstName, lastName });

      /*
       * No navigation to the profile: registration does not sign anyone in,
       * and the answer is deliberately the same whether or not the address was
       * already taken. Sending them to a profile they may not have would leak
       * exactly what the server took care not to say.
       */
      this.sent.set(result.message);
      this.form.reset();
    } catch (failure) {
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
    } finally {
      this.submitting.set(false);
    }
  }
}
