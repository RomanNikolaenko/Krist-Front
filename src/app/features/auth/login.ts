import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AuthLayout } from './auth-layout';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, T],
  styleUrl: './auth.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['roma.nikolaenko.91@gmail.com', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [true],
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

    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(email, password);

      // the guard parks the attempted url here, so a blocked visit resumes
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl ?? '/profile/personal-information');
    } catch (failure) {
      // One message for a wrong password and an unknown address — the server
      // deliberately does not distinguish them, and neither should the form.
      this.error.set(messageFrom(failure));
    } finally {
      this.submitting.set(false);
    }
  }
}

/** Pulls the server's message out of an HttpErrorResponse, with a fallback. */
export function messageFrom(failure: unknown): string {
  const body = (failure as { error?: { message?: string | string[] } } | null)?.error;
  const message = body?.message;

  if (Array.isArray(message)) return message[0];
  if (typeof message === 'string') return message;
  return 'Something went wrong. Please try again.';
}
