import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth-store';
import { AuthLayout } from './auth-layout';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, T],
  styleUrl: './auth.scss',
  styles: `
    .terms strong { font-weight: 600; }
  `,
  template: `
    <app-auth-layout image="https://picsum.photos/seed/krist-signup/900/1200" [showLogo]="true">
      <h1 class="auth-title">{{ 'auth.createTitle' | t }}</h1>
      <p class="auth-sub">{{ 'auth.enterDetails' | t }}</p>

      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <label class="field">
          <span class="field__label">{{ 'auth.firstName' | t }}</span>
          <input class="control" type="text" formControlName="firstName" autocomplete="given-name"
                 [class.is-invalid]="invalid('firstName')" />
          @if (invalid('firstName')) { <span class="field__error">{{ 'auth.firstNameRequired' | t }}</span> }
        </label>

        <label class="field">
          <span class="field__label">{{ 'auth.lastName' | t }}</span>
          <input class="control" type="text" formControlName="lastName" autocomplete="family-name"
                 [class.is-invalid]="invalid('lastName')" />
          @if (invalid('lastName')) { <span class="field__error">{{ 'auth.lastNameRequired' | t }}</span> }
        </label>

        <label class="field">
          <span class="field__label">{{ 'auth.email' | t }}</span>
          <input class="control" type="email" formControlName="email" autocomplete="email"
                 [class.is-invalid]="invalid('email')" />
          @if (invalid('email')) { <span class="field__error">{{ 'auth.emailInvalid' | t }}</span> }
        </label>

        <label class="field">
          <span class="field__label">{{ 'auth.password' | t }}</span>
          <input class="control" type="password" formControlName="password" autocomplete="new-password"
                 [class.is-invalid]="invalid('password')" />
          @if (invalid('password')) { <span class="field__error">{{ 'auth.passwordShort' | t }}</span> }
        </label>

        <label class="check terms">
          <input type="checkbox" formControlName="terms" />
          <span>{{ 'auth.agree' | t }} <strong>{{ 'auth.terms' | t }}</strong></span>
        </label>
        @if (invalid('terms')) { <span class="field__error">{{ 'auth.termsRequired' | t }}</span> }

        <button type="submit" class="btn btn--primary auth-submit">{{ 'auth.signup' | t }}</button>

        <p class="auth-row" style="justify-content:center">
          <span class="muted">{{ 'auth.haveAccount' | t }}&nbsp;</span><a class="auth-link" routerLink="/login">{{ 'auth.login' | t }}</a>
        </p>
      </form>
    </app-auth-layout>
  `,
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    terms: [true, Validators.requiredTrue],
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
    this.router.navigate(['/profile/personal-information']);
  }
}
