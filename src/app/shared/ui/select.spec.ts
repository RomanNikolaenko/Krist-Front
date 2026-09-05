import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { Select, SelectOption } from './select';

const OPTIONS: SelectOption[] = [
  { value: 'latest', label: 'Sort by latest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'rating', label: 'Top rated' },
];

@Component({
  imports: [Select],
  template: `<app-select [options]="options" [(value)]="value" ariaLabel="Sort" />`,
})
class Host {
  readonly options = OPTIONS;
  readonly value = signal('latest');
}

@Component({
  imports: [Select, ReactiveFormsModule],
  template: `<app-select [options]="options" [formControl]="control" />`,
})
class FormHost {
  readonly options = OPTIONS;
  readonly control = new FormControl('price-asc');
}

function trigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('.trigger');
}

function optionEls(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return [...fixture.nativeElement.querySelectorAll('.option')];
}

function press(fixture: ComponentFixture<unknown>, key: string): void {
  trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  fixture.detectChanges();
}

describe('Select', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('shows the label of the current value, not the raw value', () => {
    expect(trigger(fixture).textContent).toContain('Sort by latest');
  });

  it('falls back to the placeholder when nothing matches', () => {
    fixture.componentInstance.value.set('');
    fixture.detectChanges();

    expect(trigger(fixture).classList).toContain('is-empty');
  });

  it('opens and closes on click', () => {
    expect(optionEls(fixture)).toHaveLength(0);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(optionEls(fixture)).toHaveLength(3);
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');

    trigger(fixture).click();
    fixture.detectChanges();
    expect(optionEls(fixture)).toHaveLength(0);
  });

  it('writes the chosen value back through the model', () => {
    trigger(fixture).click();
    fixture.detectChanges();

    optionEls(fixture)[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('rating');
    expect(trigger(fixture).textContent).toContain('Top rated');
    expect(optionEls(fixture)).toHaveLength(0);
  });

  it('marks the selected option for assistive tech', () => {
    trigger(fixture).click();
    fixture.detectChanges();

    const selected = optionEls(fixture).filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain('Sort by latest');
  });

  it('opens on arrow down and moves the active option', () => {
    press(fixture, 'ArrowDown');
    expect(optionEls(fixture)).toHaveLength(3);

    press(fixture, 'ArrowDown');
    expect(optionEls(fixture)[1].classList).toContain('is-active');

    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toBe('price-asc');
  });

  it('wraps the active option around the ends', () => {
    press(fixture, 'ArrowUp'); // opens on the selected option, index 0
    press(fixture, 'ArrowUp'); // wraps to the last
    expect(optionEls(fixture)[2].classList).toContain('is-active');
  });

  it('closes on Escape without changing the value', () => {
    press(fixture, 'ArrowDown');
    press(fixture, 'ArrowDown');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(optionEls(fixture)).toHaveLength(0);
    expect(fixture.componentInstance.value()).toBe('latest');
  });

  it('closes when a click lands outside', () => {
    trigger(fixture).click();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(optionEls(fixture)).toHaveLength(0);
  });

  it('works as a form control', () => {
    TestBed.resetTestingModule();
    const form = TestBed.createComponent(FormHost);
    form.detectChanges();

    expect(trigger(form).textContent).toContain('Price: low to high');

    trigger(form).click();
    form.detectChanges();
    optionEls(form)[2].click();
    form.detectChanges();

    expect(form.componentInstance.control.value).toBe('rating');
  });

  it('reflects a disabled form control', () => {
    TestBed.resetTestingModule();
    const form = TestBed.createComponent(FormHost);
    form.componentInstance.control.disable();
    form.detectChanges();

    expect(trigger(form).disabled).toBe(true);
  });
});
