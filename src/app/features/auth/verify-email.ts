import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AuthLayout } from './auth-layout';
import { apiMessage } from '../../core/api-error';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';

type State = 'checking' | 'done' | 'failed' | 'no-token';

/**
 * Where the confirmation email lands.
 *
 * The address it points at existed on the server and nowhere else: the link
 * arrived at the app's catch-all route and quietly redirected to the home page,
 * so an account could be registered and never confirmed. Turning
 * REQUIRE_VERIFIED_EMAIL on would have locked everybody out.
 *
 * A failed token is usually an expired one, so the screen offers to send
 * another rather than leaving the reader at a dead end.
 */
@Component({
  selector: 'app-verify-email',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, T],
  styleUrl: './auth.scss',
  templateUrl: './verify-email.html',
})
export class VerifyEmail {
  private readonly i18n = inject(I18n);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  protected readonly state = signal<State>(this.token ? 'checking' : 'no-token');
  protected readonly error = signal<string | null>(null);
  protected readonly resent = signal(false);
  protected readonly resending = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    if (this.token) void this.confirm();
  }

  private async confirm(): Promise<void> {
    try {
      await this.auth.verifyEmail(this.token);
      this.state.set('done');
    } catch (failure) {
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
      this.state.set('failed');
    }
  }

  protected async resend(): Promise<void> {
    if (this.form.invalid || this.resending()) {
      this.form.markAllAsTouched();
      return;
    }

    this.resending.set(true);
    this.error.set(null);

    try {
      await this.auth.resendVerification(this.form.controls.email.value);
      this.resent.set(true);
    } catch (failure) {
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
    } finally {
      this.resending.set(false);
    }
  }
}
