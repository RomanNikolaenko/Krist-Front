import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styles: `
    nav { display: flex; align-items: center; justify-content: center; gap: 0.625rem; }
    button {
      min-width: 3rem; height: 3rem;
      display: grid; place-items: center;
      border: none; border-radius: var(--r-sm);
      background: transparent; color: var(--c-heading);
      font-size: var(--fs-sm);
      &:hover:not(:disabled):not(.is-active) { background: var(--c-surface); }
      &:disabled { color: var(--c-placeholder); cursor: not-allowed; }
    }
    .is-active { background: var(--c-ink); color: var(--c-on-ink); }
  `,
  template: `
    <nav aria-label="Pagination">
      <button type="button" (click)="go(page() - 1)" [disabled]="page() === 1" [attr.aria-label]="'pagination.prev' | t">
        <app-icon [name]="'arrow-left'" [size]="24" />
      </button>
      @for (p of pageList(); track p) {
        <button type="button" class="num" [class.is-active]="p === page()" (click)="go(p)"
                [attr.aria-current]="p === page() ? 'page' : null">{{ p }}</button>
      }
      <button type="button" (click)="go(page() + 1)" [disabled]="page() === pages()" [attr.aria-label]="'pagination.next' | t">
        <app-icon [name]="'arrow-right'" [size]="24" />
      </button>
    </nav>
  `,
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
