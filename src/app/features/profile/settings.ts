import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountApi } from '../../core/account.api';
import { AuthService } from '../../core/auth/auth.service';
import { I18n, LanguageCode } from '../../core/i18n/i18n';
import { Appearance, APPEARANCES, ThemeStore } from '../../core/theme-store';
import { Select, SelectOption } from '../../shared/ui/select';
import { Modal } from '../../shared/ui/modal';
import { apiMessage } from '../../core/api-error';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Select, Modal, T],
  styleUrl: './settings.scss',
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly theme = inject(ThemeStore);
  protected readonly i18n = inject(I18n);
  private readonly api = inject(AccountApi);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly appearanceOptions = computed<SelectOption[]>(() =>
    APPEARANCES.map((a) => ({ value: a, label: this.i18n.translate('appearance.' + a) })),
  );

  protected readonly languageOptions: SelectOption[] = this.i18n.languages.map((l) => ({
    value: l.code,
    label: l.label,
  }));

  /** The confirmation dialog, and what it needs to go through with it. */
  protected readonly confirming = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');
  protected password = '';

  protected readonly deleteLoses = [
    'settings.deleteLosesOrders',
    'settings.deleteLosesReviews',
    'settings.deleteLosesLikes',
    'settings.deleteLosesRest',
  ];

  protected openDelete(): void {
    this.password = '';
    this.deleteError.set('');
    this.confirming.set(true);
  }

  /**
   * Closes the account and leaves.
   *
   * Leaving comes before clearing the auth state, because clearing it empties
   * the account store, and the profile screen would spend a frame rendering a
   * profile with nothing in it before the navigation caught up.
   */
  protected async confirmDelete(): Promise<void> {
    if (this.deleting()) return;

    this.deleting.set(true);
    this.deleteError.set('');

    try {
      await this.api.deleteAccount(this.password);
      await this.router.navigate(['/']);
      this.auth.clear();
      this.confirming.set(false);
    } catch (error) {
      this.deleteError.set(apiMessage(error, this.i18n.translate('settings.deleteFailed')));
    } finally {
      this.deleting.set(false);
    }
  }

  /** The server says why in words worth showing; anything else gets the fallback. */
  protected setAppearance(value: string): void {
    this.theme.set(value as Appearance);
  }

  protected setLanguage(value: string): void {
    this.i18n.use(value as LanguageCode);
  }
}
