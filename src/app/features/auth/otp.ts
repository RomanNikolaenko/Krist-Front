import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthLayout } from './auth-layout';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

const LENGTH = 5;

@Component({
  selector: 'app-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthLayout, Icon, T],
  styleUrl: './auth.scss',
  styles: `
    .boxes { display: flex; gap: 1.25rem; margin-bottom: 1.625rem; }

    .boxes input {
      width: 3.625rem;
      height: 3.625rem;
      border: 0.0625rem solid var(--c-line-strong);
      border-radius: var(--r-md);
      text-align: center;
      font: inherit;
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--c-heading);
      &:focus { outline: none; border-color: var(--c-ink); box-shadow: 0 0 0 0.1875rem rgba(23,23,31,.08); }
    }

    .error { color: var(--c-danger); font-size: var(--fs-sm); margin-bottom: 0.875rem; }

    @media (max-width: 37.5rem) {
      .boxes { gap: 0.625rem; }
      .boxes input { width: 3.125rem; height: 3.125rem; }
    }
  `,
  template: `
    <app-auth-layout image="https://picsum.photos/seed/krist-otp/900/1200">
      <button type="button" class="auth-back" (click)="back()">
        <app-icon [name]="'chevron-left'" [size]="24" />
        {{ 'auth.back' | t }}
      </button>

      <h1 class="auth-title">{{ 'auth.otpTitle' | t }}</h1>
      <p class="auth-sub">{{ 'auth.otpText' | t }}<br />{{ email() }}</p>

      <div class="boxes">
        @for (i of slots; track i) {
          <input #slot type="text" inputmode="numeric" maxlength="1" [value]="digits()[i]"
                 (input)="onInput(i, $event)" (keydown)="onKeydown(i, $event)"
                 [attr.aria-label]="'auth.otpDigit' | t: { index: i + 1 }" />
        }
      </div>

      @if (error()) { <p class="error">{{ 'auth.otpIncomplete' | t: { count: slots.length } }}</p> }

      <button type="button" class="btn btn--primary btn--block auth-submit" (click)="verify()">{{ 'auth.verify' | t }}</button>
    </app-auth-layout>
  `,
})
export class Otp {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly slots = Array.from({ length: LENGTH }, (_, i) => i);
  protected readonly digits = signal<string[]>(['3', '1', '', '', '']);
  protected readonly error = signal(false);
  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('slot');

  protected readonly email = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((p) => p.get('email') ?? 'robertfox@example.com')),
    { initialValue: 'robertfox@example.com' },
  );

  protected onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);
    input.value = value;

    this.digits.update((d) => d.map((x, i) => (i === index ? value : x)));
    if (value && index < LENGTH - 1) this.focus(index + 1);
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) this.focus(index - 1);
  }

  protected verify(): void {
    if (this.digits().some((d) => !d)) {
      this.error.set(true);
      return;
    }
    this.router.navigate(['/password-changed']);
  }

  protected back(): void {
    this.location.back();
  }

  private focus(index: number): void {
    this.inputs()[index]?.nativeElement.focus();
  }
}
