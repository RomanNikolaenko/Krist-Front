import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { AuthLayout } from './auth-layout';
import { Icon } from '../../shared/ui/icon';
import { apiMessage } from '../../core/api-error';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';

/**
 * Asks the server to send a reset link.
 *
 * It used to send nothing: the form navigated to a six-box code screen that
 * accepted any digits and then announced the password had been changed. The
 * server has had `/auth/forgot-password` and a link-with-a-token flow all
 * along; this is the screen that finally uses it.
 */
@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AuthLayout, Icon, T],
  styleUrl: './auth.scss',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly i18n = inject(I18n);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);

  protected readonly sent = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected invalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.dirty || c.touched);
  }

  protected back(): void {
    this.location.back();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      await this.auth.forgotPassword(this.form.controls.email.value);

      /*
       * The same answer either way. The server does not say whether that
       * address has an account — telling this screen would turn it into a way
       * of asking who shops here — so the screen does not claim to know.
       */
      this.sent.set(true);
    } catch (failure) {
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
    } finally {
      this.submitting.set(false);
    }
  }
}
