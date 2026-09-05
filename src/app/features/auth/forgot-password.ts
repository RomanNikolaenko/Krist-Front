import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthLayout } from './auth-layout';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AuthLayout, Icon, T],
  styleUrl: './auth.scss',
  template: `
    <app-auth-layout image="https://picsum.photos/seed/krist-forgot/900/1200">
      <button type="button" class="auth-back" (click)="back()">
        <app-icon [name]="'chevron-left'" [size]="24" />
        {{ 'auth.back' | t }}
      </button>

      <h1 class="auth-title">{{ 'auth.forgotTitle' | t }}</h1>
      <p class="auth-sub">{{ 'auth.forgotText' | t }}</p>

      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <label class="field">
          <span class="field__label">{{ 'auth.email' | t }}</span>
          <input class="control" type="email" formControlName="email" autocomplete="email"
                 [class.is-invalid]="invalid()" />
          @if (invalid()) { <span class="field__error">{{ 'auth.emailInvalid' | t }}</span> }
        </label>

        <button type="submit" class="btn btn--primary auth-submit">{{ 'auth.sendOtp' | t }}</button>
      </form>
    </app-auth-layout>
  `,
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly form = this.fb.nonNullable.group({
    email: ['robertfox@example.com', [Validators.required, Validators.email]],
  });

  protected invalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.dirty || c.touched);
  }

  protected back(): void {
    this.location.back();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/otp'], { queryParams: { email: this.form.controls.email.value } });
  }
}
