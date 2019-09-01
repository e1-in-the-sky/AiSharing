import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationFilterPage } from './reservation-filter.page';

describe('ReservationFilterPage', () => {
  let component: ReservationFilterPage;
  let fixture: ComponentFixture<ReservationFilterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationFilterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
