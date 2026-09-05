import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon } from '../../shared/ui/icon';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, FeatureStrip, T],
  styles: `
    :host { display: block; }

    .lead {
      max-width: 38rem;
      font-size: 1.125rem;
      color: var(--c-body);
      margin-bottom: 2.5rem;
      text-wrap: balance;
    }

    .layout {
      display: grid;
      grid-template-columns: 20rem 1fr;
      gap: 3.75rem;
      align-items: start;
      margin-bottom: 3rem;
    }

    h2 { font-size: var(--fs-h3); font-weight: 600; margin-bottom: 1.5rem; }

    .info { display: flex; flex-direction: column; gap: 1.5rem; }

    .info__row {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;

      app-icon { color: var(--c-heading); margin-top: 0.125rem; }
    }

    .info__label { font-size: var(--fs-xs); color: var(--c-muted); display: block; }

    .info__value {
      font-size: var(--fs-body);
      color: var(--c-heading);

      a { color: inherit; &:hover { text-decoration: underline; } }
    }

    form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .full { grid-column: 1 / -1; }
    .submit { justify-self: start; padding-inline: 2.5rem; }
    .sent { color: var(--c-success); font-size: var(--fs-sm); }

    @container page (max-width: 52rem) {
      .layout { grid-template-columns: 1fr; gap: 2.5rem; }
      form { grid-template-columns: 1fr; }
    }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'contact.title' | t }}</h1>
      <p class="lead">{{ 'contact.lead' | t }}</p>

      <div class="layout">
        <section>
          <h2>{{ 'contact.reachUs' | t }}</h2>

          <div class="info">
            <div class="info__row">
              <app-icon [name]="'phone'" [size]="24" />
              <div>
                <span class="info__label">{{ 'contact.phone' | t }}</span>
                <span class="info__value"><a href="tel:+17045550127">(704) 555-0127</a></span>
              </div>
            </div>

            <div class="info__row">
              <app-icon [name]="'mail'" [size]="24" />
              <div>
                <span class="info__label">{{ 'contact.email' | t }}</span>
                <span class="info__value">
                  <a href="mailto:krist&#64;example.com">krist&#64;example.com</a>
                </span>
              </div>
            </div>

            <div class="info__row">
              <app-icon [name]="'pin'" [size]="24" />
              <div>
                <span class="info__label">{{ 'contact.address' | t }}</span>
                <span class="info__value">3891 Ranchview Dr.<br />Richardson, California 62639</span>
              </div>
            </div>

            <div class="info__row">
              <app-icon [name]="'clipboard'" [size]="24" />
              <div>
                <span class="info__label">{{ 'contact.hours' | t }}</span>
                <span class="info__value">{{ 'contact.hoursValue' | t }}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>{{ 'contact.formTitle' | t }}</h2>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <label class="field">
              <span class="field__label">{{ 'contact.name' | t }}</span>
              <input class="control" type="text" formControlName="name"
                     [placeholder]="'contact.namePlaceholder' | t" [class.is-invalid]="invalid('name')" />
              @if (invalid('name')) { <span class="field__error">{{ 'contact.nameRequired' | t }}</span> }
            </label>

            <label class="field">
              <span class="field__label">{{ 'contact.emailLabel' | t }}</span>
              <input class="control" type="email" formControlName="email"
                     [placeholder]="'contact.emailPlaceholder' | t" [class.is-invalid]="invalid('email')" />
              @if (invalid('email')) { <span class="field__error">{{ 'contact.emailInvalid' | t }}</span> }
            </label>

            <label class="field full">
              <span class="field__label">{{ 'contact.subject' | t }}</span>
              <input class="control" type="text" formControlName="subject"
                     [placeholder]="'contact.subjectPlaceholder' | t" [class.is-invalid]="invalid('subject')" />
              @if (invalid('subject')) { <span class="field__error">{{ 'contact.subjectRequired' | t }}</span> }
            </label>

            <label class="field full">
              <span class="field__label">{{ 'contact.message' | t }}</span>
              <textarea class="control" formControlName="message" rows="6"
                        [placeholder]="'contact.messagePlaceholder' | t"
                        [class.is-invalid]="invalid('message')"></textarea>
              @if (invalid('message')) { <span class="field__error">{{ 'contact.messageRequired' | t }}</span> }
            </label>

            <button type="submit" class="btn btn--primary submit full">{{ 'contact.send' | t }}</button>

            @if (sent()) { <p class="sent full">{{ 'contact.sent' | t }}</p> }
          </form>
        </section>
      </div>

      <app-feature-strip />
    </div>
  `,
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
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
    this.sent.set(true);
    this.form.reset();
  }
}
