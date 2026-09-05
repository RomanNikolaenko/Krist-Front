import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth-store';
import { AuthLayout } from './auth-layout';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, T],
  styleUrl: './auth.scss',
  template: `
    <app-auth-layout image="https://picsum.photos/seed/krist-login/900/1200" [showLogo]="true">
      <h1 class="auth-title">{{ 'auth.welcome' | t }} <span aria-hidden="true">👋</span></h1>
      <p class="auth-sub">{{ 'auth.pleaseLogin' | t }}</p>

      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <label class="field">
          <span class="field__label">{{ 'auth.email' | t }}</span>
          <input class="control" type="email" formControlName="email" autocomplete="email"
                 [class.is-invalid]="invalid('email')" />
          @if (invalid('email')) { <span class="field__error">{{ 'auth.emailInvalid' | t }}</span> }
        </label>

        <label class="field">
          <span class="field__label">{{ 'auth.password' | t }}</span>
          <input class="control" type="password" formControlName="password" autocomplete="current-password"
                 [class.is-invalid]="invalid('password')" />
          @if (invalid('password')) { <span class="field__error">{{ 'auth.passwordRequired' | t }}</span> }
        </label>

        <div class="auth-row">
          <label class="check">
            <input type="checkbox" formControlName="remember" />
            <span>{{ 'auth.rememberMe' | t }}</span>
          </label>
          <a class="auth-link" routerLink="/forgot-password">{{ 'auth.forgotPassword' | t }}</a>
        </div>

        <button type="submit" class="btn btn--primary auth-submit">{{ 'auth.login' | t }}</button>

        <p class="auth-row" style="justify-content:center">
          <span class="muted">{{ 'auth.newHere' | t }}&nbsp;</span><a class="auth-link" routerLink="/signup">{{ 'auth.createAccount' | t }}</a>
        </p>
      </form>
    </app-auth-layout>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthStore);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['robertfox@example.com', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [true],
  });

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.signIn(this.form.getRawValue().email);

    // the guard parks the attempted url here, so a blocked visit resumes
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl ?? '/profile/personal-information');
  }
}
