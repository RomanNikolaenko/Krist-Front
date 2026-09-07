import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Breadcrumbs, Crumb } from './breadcrumbs';
import { Pagination } from './pagination';
import { Select, SelectOption } from './select';

/*
 * These three take a list from somewhere else — a resource, a parent, a
 * computed — and every one of those can hand over an empty array. The rule is
 * the same in each case: no items, no chrome around them. A nav with a gap, a
 * pager with two arrows either side of nothing, a listbox that opens onto a
 * white sliver: all of those are worse than the component simply not being
 * there, and all three used to happen.
 */

@Component({
  imports: [Breadcrumbs],
  template: `<app-breadcrumbs [items]="items()" />`,
})
class CrumbHost {
  readonly items = signal<Crumb[]>([]);
}

@Component({
  imports: [Pagination],
  template: `<app-pagination [page]="1" [pages]="pages()" />`,
})
class PagerHost {
  readonly pages = signal(1);
}

@Component({
  imports: [Select],
  template: `<app-select [options]="options()" [value]="''" ariaLabel="Sort" />`,
})
class SelectHost {
  readonly options = signal<SelectOption[]>([]);
}

function make<T>(host: new () => T): ComponentFixture<T> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([])] });

  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

describe('empty collections', () => {
  describe('Breadcrumbs', () => {
    let fixture: ComponentFixture<CrumbHost>;

    beforeEach(() => {
      fixture = make(CrumbHost);
    });

    it('renders no nav at all when the trail is empty', () => {
      expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    });

    it('renders the trail once there is one', () => {
      fixture.componentInstance.items.set([
        { label: 'Каталог', link: '/shop' },
        { label: 'Чоловікам' },
      ]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('nav')).toHaveLength(1);
      expect(fixture.nativeElement.textContent).toContain('Чоловікам');
    });
  });

  describe('Pagination', () => {
    it('renders nothing for a single page', () => {
      expect(make(PagerHost).nativeElement.querySelector('nav')).toBeNull();
    });

    it('renders the pager as soon as there are two', () => {
      const fixture = make(PagerHost);
      fixture.componentInstance.pages.set(2);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.num')).toHaveLength(2);
    });
  });

  describe('Select', () => {
    it('does not open onto an empty listbox', () => {
      const fixture = make(SelectHost);
      fixture.nativeElement.querySelector('.trigger').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.panel')).toBeNull();
    });

    it('opens once the options arrive', () => {
      const fixture = make(SelectHost);
      fixture.componentInstance.options.set([{ value: 'latest', label: 'Найновіші' }]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.trigger').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.option')).toHaveLength(1);
    });
  });
});
