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
  styles: `
    :host { display: block; }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding-block: 1.375rem;
      border-bottom: 0.0625rem solid var(--c-line);
    }
    .row:last-child { border-bottom: none; }

    .title { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }
    .text { font-size: var(--fs-sm); color: var(--c-muted); margin-top: 0.125rem; }

    app-select { flex: none; min-width: 8.25rem; }

    @container panel (max-width: 30rem) {
      .row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    }
  `,
  template: `
    <div class="row">
      <div>
        <p class="title">{{ 'settings.appearance' | t }}</p>
        <p class="text">{{ 'settings.appearanceText' | t }}</p>
      </div>
      <app-select
        variant="soft"
        [options]="appearanceOptions()"
        [value]="theme.appearance()"
        [ariaLabel]="'settings.appearance' | t"
        (valueChange)="setAppearance($event)" />
    </div>

    <div class="row">
      <div>
        <p class="title">{{ 'settings.language' | t }}</p>
        <p class="text">{{ 'settings.languageText' | t }}</p>
      </div>
      <app-select
        variant="soft"
        [options]="languageOptions"
        [value]="i18n.lang()"
        [ariaLabel]="'settings.language' | t"
        (valueChange)="setLanguage($event)" />
    </div>

    @for (item of switches; track item.key) {
      <div class="row">
        <div>
          <p class="title">{{ item.titleKey | t }}</p>
          <p class="text">{{ item.textKey | t }}</p>
        </div>
        <app-toggle-switch [checked]="toggles()[item.key]" [label]="item.titleKey | t"
                           (checkedChange)="setToggle(item.key, $event)" />
      </div>
    }
  `,
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

  protected readonly toggles = persistentSignal<Record<ToggleKey, boolean>>('krist.settings.toggles', {
    twoFactor: true,
    push: true,
    desktop: true,
    email: true,
  });

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
