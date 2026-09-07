import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountStore } from '../../core/account-store';
import { I18n } from '../../core/i18n/i18n';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-personal-information',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, T],
  styleUrl: './personal-information.scss',
  templateUrl: './personal-information.html',
})
export class PersonalInformation {
  protected readonly account = inject(AccountStore);
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18n);

  protected readonly editing = signal(false);
  protected readonly uploading = signal(false);
  protected readonly photoError = signal('');
  protected readonly savedAt = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.account.profile().firstName, Validators.required],
    lastName: [this.account.profile().lastName, Validators.required],
    phone: [
      this.account.profile().phone,
      [Validators.required, Validators.pattern(/^[\d\s()+-]{7,}$/)],
    ],
    email: [this.account.profile().email, [Validators.required, Validators.email]],
    address: [this.account.profile().address],
  });

  constructor() {
    this.form.disable();

    /*
     * The store fills itself in from `/auth/me`, which can land after this
     * component is built — so the form cannot be a one-time snapshot of it, or
     * it goes on showing whatever it was constructed with. Skipped while
     * editing, so a refresh never overwrites something half-typed.
     */
    effect(() => {
      const profile = this.account.profile();
      if (untracked(this.editing)) return;

      this.form.reset(profile);
    });
  }

  /**
   * Sends the chosen picture straight away rather than waiting for the form to
   * be saved: a photo is not one of the fields being edited, and making people
   * press Save to see it would only raise the question of what Cancel means.
   *
   * The input is reset afterwards so choosing the same file twice still fires.
   */
  protected async onPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.photoError.set('');
    this.uploading.set(true);
    try {
      await this.account.uploadAvatar(file);
    } catch {
      this.photoError.set(this.i18n.translate('personal.photoFailed'));
    } finally {
      this.uploading.set(false);
    }
  }

  protected async removePhoto(): Promise<void> {
    this.photoError.set('');
    await this.account.removeAvatar();
  }

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected toggleEdit(): void {
    if (!this.editing()) {
      this.form.enable();
      /*
       * Everything but the address. Moving an account to a new email is an
       * authentication change — the new one has to be proved and the old one
       * told — so the API refuses it here and the field says so by staying shut.
       */
      this.form.controls.email.disable();
      this.editing.set(true);
      this.savedAt.set(false);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.account.updateProfile(this.form.getRawValue());
    this.form.disable();
    this.editing.set(false);
    this.savedAt.set(true);
  }
}
