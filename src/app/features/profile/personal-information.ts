import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountStore } from '../../core/account-store';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-personal-information',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, T],
  styles: `
    :host { display: block; }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.25rem;
      margin-bottom: 1.875rem;
    }

    /*
     * flex:none, or the row squeezes the box while the global max-width on img pulls the
     * photo in with it — the height stays put and the circle turns into an egg.
     */
    .avatar { position: relative; flex: none; width: 6.25rem; height: 6.25rem; }
    .avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

    .avatar button {
      position: absolute;
      // tangent to the rim from the inside: 3.125rem radius less the badge's 1.25rem
      right: 0.5rem; bottom: 0.5rem;
      width: 2.5rem; height: 2.5rem;
      display: grid; place-items: center;
      border: 0.125rem solid var(--c-panel);
      border-radius: 50%;
      background: var(--c-ink);
      color: var(--c-on-ink);
      padding: 0;
    }

    form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .full { grid-column: 1 / -1; }

    .control:disabled { background: var(--c-panel); color: var(--c-heading); -webkit-text-fill-color: var(--c-heading); opacity: 1; }

    .saved { color: var(--c-success); font-size: var(--fs-sm); }

    @container panel (max-width: 32rem) { form { grid-template-columns: 1fr; } }
  `,
  template: `
    <div class="head">
      <div class="avatar">
        <img [src]="account.profile().avatar" [alt]="account.fullName()" width="160" height="160" />
        <button type="button" [attr.aria-label]="'personal.changePhoto' | t"><app-icon [name]="'edit'" [size]="24" /></button>
      </div>

      <button type="button" class="btn btn--primary" (click)="toggleEdit()">
        <app-icon [name]="'edit'" [size]="24" />
        {{ (editing() ? 'personal.saveProfile' : 'personal.editProfile') | t }}
      </button>
    </div>

    <form [formGroup]="form">
      <label class="field">
        <span class="field__label">{{ 'personal.firstName' | t }}</span>
        <input class="control" type="text" formControlName="firstName" [class.is-invalid]="invalid('firstName')" />
        @if (invalid('firstName')) { <span class="field__error">{{ 'personal.firstNameRequired' | t }}</span> }
      </label>

      <label class="field">
        <span class="field__label">{{ 'personal.lastName' | t }}</span>
        <input class="control" type="text" formControlName="lastName" [class.is-invalid]="invalid('lastName')" />
        @if (invalid('lastName')) { <span class="field__error">{{ 'personal.lastNameRequired' | t }}</span> }
      </label>

      <label class="field">
        <span class="field__label">{{ 'personal.phone' | t }}</span>
        <input class="control" type="tel" formControlName="phone" [class.is-invalid]="invalid('phone')" />
        @if (invalid('phone')) { <span class="field__error">{{ 'personal.phoneInvalid' | t }}</span> }
      </label>

      <label class="field">
        <span class="field__label">{{ 'personal.email' | t }}</span>
        <input class="control" type="email" formControlName="email" [class.is-invalid]="invalid('email')" />
        @if (invalid('email')) { <span class="field__error">{{ 'personal.emailInvalid' | t }}</span> }
      </label>

      <label class="field full">
        <span class="field__label">{{ 'personal.address' | t }}</span>
        <input class="control" type="text" formControlName="address" />
      </label>

      @if (savedAt()) { <p class="saved full">{{ 'personal.updated' | t }}</p> }
    </form>
  `,
})
export class PersonalInformation {
  protected readonly account = inject(AccountStore);
  private readonly fb = inject(FormBuilder);

  protected readonly editing = signal(false);
  protected readonly savedAt = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.account.profile().firstName, Validators.required],
    lastName: [this.account.profile().lastName, Validators.required],
    phone: [this.account.profile().phone, [Validators.required, Validators.pattern(/^[\d\s()+-]{7,}$/)]],
    email: [this.account.profile().email, [Validators.required, Validators.email]],
    address: [this.account.profile().address],
  });

  constructor() {
    this.form.disable();
  }

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected toggleEdit(): void {
    if (!this.editing()) {
      this.form.enable();
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
