import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styleUrl: './pagination.scss',
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly page = input(1);
  readonly pages = input(1);
  readonly pageChange = output<number>();

  protected readonly pageList = computed(() =>
    Array.from({ length: this.pages() }, (_, i) => i + 1),
  );

  protected go(p: number): void {
    if (p >= 1 && p <= this.pages() && p !== this.page()) this.pageChange.emit(p);
  }
}
