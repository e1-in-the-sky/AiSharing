import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxiReservationPage } from './taxi-reservation.page';

describe('TaxiReservationPage', () => {
  let component: TaxiReservationPage;
  let fixture: ComponentFixture<TaxiReservationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxiReservationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxiReservationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
