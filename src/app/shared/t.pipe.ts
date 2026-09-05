import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n, TranslationParams } from '../core/i18n/i18n';
import { TranslationKey } from '../core/i18n/en';

/**
 * `{{ 'nav.home' | t }}` — or with placeholders, `{{ 'cart.remove' | t: { name } }}`.
 *
 * The pipe is pure: switching language recreates the whole view tree from the
 * root component, which drops the cached values along with the pipe instances.
 */
@Pipe({ name: 't' })
export class T implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: TranslationKey | string, params?: TranslationParams): string {
    return this.i18n.translate(key, params);
  }
}
