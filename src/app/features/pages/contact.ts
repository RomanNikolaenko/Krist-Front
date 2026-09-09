import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactApi } from '../../core/contact.api';
import { Icon } from '../../shared/ui/icon';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { apiMessage } from '../../core/api-error';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, FeatureStrip, T],
  styleUrl: './contact.scss',
  templateUrl: './contact.html',
})
export class Contact {
  private readonly i18n = inject(I18n);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ContactApi);

  protected readonly sent = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.sending()) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);
    this.error.set(null);

    try {
      await this.api.send(this.form.getRawValue());
      this.sent.set(true);
      this.form.reset();
    } catch (failure) {
      // Saying "sent" over a failure is the bug this screen used to have in
      // its purest form: it said it every time, having sent nothing at all.
      this.error.set(apiMessage(failure, this.i18n.translate('common.failed')));
    } finally {
      this.sending.set(false);
    }
  }
}
