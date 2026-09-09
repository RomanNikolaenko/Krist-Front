import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AuthLayout } from './auth-layout';
import { apiMessage } from '../../core/api-error';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';

/**
 * The other half of "forgot password": the screen the emailed link opens.
 *
 * The link carries a token, and the token is the proof — the address is never
 * asked for again, because whoever can read that inbox is who the server is
 * willing to believe. Without one there is nothing to do here, and the screen
 * says so rather than showing a form that could not work.
 */
@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, T],
  styleUrl: './auth.scss',
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly i18n = inject(I18n);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  });

  protected invalid(control: 'password' | 'confirm'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  /** Checked here rather than by a validator, so it can be shown on its own. */
  protected mismatched(): boolean {
    const { password, confirm } = this.form.getRawValue();
    return this.form.controls.confirm.touched && confirm !== '' && password !== confirm;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.mismatched() || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      await this.auth.resetPassword(this.token, this.form.controls.password.value);
      void this.router.navigate(['/password-changed']);
    } catch (failure) {
      // An expired or already-spent token lands here, and saying so is the
      // point: the way out is a new link, not a different password.
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
    } finally {
      this.submitting.set(false);
    }
  }
}
