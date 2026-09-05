import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './toggle-switch.scss',
  templateUrl: './toggle-switch.html',
})
export class ToggleSwitch {
  readonly checked = input(false);
  readonly label = input('');
  readonly checkedChange = output<boolean>();
}
