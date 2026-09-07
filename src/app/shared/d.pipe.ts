import { formatDate } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n } from '../core/i18n/i18n';

/**
 * `{{ order.placedAt | d: 'd MMMM y' }}` — a date in the language being read.
 *
 * Angular's own DatePipe formats against LOCALE_ID, which is fixed for the life
 * of the application: every date on the site came out in English regardless of
 * the switch in the header. This asks the same question the `t` pipe does, and
 * is pure for the same reason — changing language rebuilds the view tree from
 * the root, so nothing cached survives to be shown in the wrong one.
 */
@Pipe({ name: 'd' })
export class D implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: Date | string | number | null | undefined, format = 'mediumDate'): string {
    if (value === null || value === undefined || value === '') return '';

    return formatDate(value, format, this.i18n.lang());
  }
}
