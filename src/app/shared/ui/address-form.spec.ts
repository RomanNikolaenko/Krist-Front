import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18n } from '../../core/i18n/i18n';
import { Address } from '../../core/models';
import { AddressForm } from './address-form';

const ADDRESS: Address = {
  id: 'addr-1',
  name: 'Marcus Bell',
  phone: '(702) 555-0163',
  line1: '3320 E Brown Rd',
  area: 'East Mesa',
  city: 'Mesa',
  pin: '85201',
  state: 'Nevada',
  isDefault: true,
};

@Component({
  imports: [AddressForm],
  template: `<app-address-form [value]="value()" />`,
})
class Host {
  readonly value = signal<Address | null>(null);
}

describe('AddressForm', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;

  const values = (): string[] =>
    [...fixture.nativeElement.querySelectorAll('input.control')].map(
      (input) => (input as HTMLInputElement).value,
    );

  beforeEach(() => {
    TestBed.resetTestingModule();
    // Pinned, so the labels below do not depend on the machine running this.
    TestBed.inject(I18n).use('en');
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('fills itself in from the address it is handed', () => {
    fixture.componentInstance.value.set(ADDRESS);
    fixture.detectChanges();

    expect(values()).toContain('Marcus Bell');
    expect(values()).toContain('Nevada');
  });

  /*
   * The regression this exists for: the form is projected into a dialog, so it
   * is built with its parent and outlives every open and close. Editing an
   * address and then choosing "add a new one" opened the dialog on the old
   * address, filled in and one click away from being saved as a duplicate.
   */
  it('empties itself when handed nothing, however full it was', () => {
    fixture.componentInstance.value.set(ADDRESS);
    fixture.detectChanges();

    fixture.componentInstance.value.set(null);
    fixture.detectChanges();

    expect(values().every((value) => value === '')).toBe(true);
  });

  it('asks for the city and the state rather than offering a list of six', () => {
    const labels = [...fixture.nativeElement.querySelectorAll('.field__label')].map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );

    expect(labels).toContain('City');
    expect(labels).toContain('State');
    expect(fixture.nativeElement.querySelectorAll('app-select')).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('input.control')).toHaveLength(7);
  });
});
