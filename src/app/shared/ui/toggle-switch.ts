import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: inline-flex; }

    button {
      position: relative;
      width: 3.25rem;
      height: 1.8125rem;
      flex: none;
      border: none;
      border-radius: var(--r-pill);
      background: var(--c-line);
      transition: background .18s ease;
      padding: 0;

      &::after {
        content: '';
        position: absolute;
        top: 0.1875rem;
        left: 0.1875rem;
        width: 1.4375rem;
        height: 1.4375rem;
        border-radius: 50%;
        background: var(--c-fixed-white);
        transition: transform .18s ease;
      }

      &.is-on { background: var(--c-toggle-on); }
      &.is-on::after { transform: translateX(1.4375rem); }
      &:focus-visible { outline: 0.125rem solid var(--c-ink); outline-offset: 0.125rem; }
    }
  `,
  template: `
    <button type="button" role="switch" [class.is-on]="checked()"
            [attr.aria-checked]="checked()" [attr.aria-label]="label()"
            (click)="checkedChange.emit(!checked())"></button>
  `,
})
export class ToggleSwitch {
  readonly checked = input(false);
  readonly label = input('');
  readonly checkedChange = output<boolean>();
}
