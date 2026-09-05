import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

/** Success state: the reset screen sits blurred behind a confirmation card. */
@Component({
  selector: 'app-password-changed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, T],
  styleUrl: './password-changed.scss',
  templateUrl: './password-changed.html',
})
export class PasswordChanged {}
