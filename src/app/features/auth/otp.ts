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
  styleUrls: ['./auth.scss', './otp.scss'],
  templateUrl: './otp.html',
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
