import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../shared/ui/logo';
import { T } from '../../shared/t.pipe';

/** Split screen shared by every auth frame: artwork left, form right. */
@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, T],
  styleUrl: './auth-layout.scss',
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly image = input.required<string>();
  readonly showLogo = input(false);
}
