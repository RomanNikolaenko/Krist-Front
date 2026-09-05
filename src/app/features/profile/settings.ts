import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18n, LanguageCode } from '../../core/i18n/i18n';
import { Appearance, APPEARANCES, ThemeStore } from '../../core/theme-store';
import { persistentSignal } from '../../core/storage';
import { ToggleSwitch } from '../../shared/ui/toggle-switch';
import { Select, SelectOption } from '../../shared/ui/select';
import { T } from '../../shared/t.pipe';

type ToggleKey = 'twoFactor' | 'push' | 'desktop' | 'email';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitch, Select, T],
  styleUrl: './settings.scss',
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly theme = inject(ThemeStore);
  protected readonly i18n = inject(I18n);

  protected readonly appearanceOptions = computed<SelectOption[]>(() =>
    APPEARANCES.map((a) => ({ value: a, label: this.i18n.translate('appearance.' + a) })),
  );

  protected readonly languageOptions: SelectOption[] = this.i18n.languages.map((l) => ({
    value: l.code,
    label: l.label,
  }));

  protected readonly switches: { key: ToggleKey; titleKey: string; textKey: string }[] = [
    { key: 'twoFactor', titleKey: 'settings.twoFactor', textKey: 'settings.twoFactorText' },
    { key: 'push', titleKey: 'settings.push', textKey: 'settings.pushText' },
    { key: 'desktop', titleKey: 'settings.desktop', textKey: 'settings.desktopText' },
    { key: 'email', titleKey: 'settings.email', textKey: 'settings.emailText' },
  ];

  protected readonly toggles = persistentSignal<Record<ToggleKey, boolean>>(
    'krist.settings.toggles',
    {
      twoFactor: true,
      push: true,
      desktop: true,
      email: true,
    },
  );

  protected setAppearance(value: string): void {
    this.theme.set(value as Appearance);
  }

  protected setLanguage(value: string): void {
    this.i18n.use(value as LanguageCode);
  }

  protected setToggle(key: ToggleKey, value: boolean): void {
    this.toggles.update((t) => ({ ...t, [key]: value }));
  }
}
