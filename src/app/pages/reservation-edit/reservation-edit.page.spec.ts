import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationEditPage } from './reservation-edit.page';

describe('ReservationEditPage', () => {
  let component: ReservationEditPage;
  let fixture: ComponentFixture<ReservationEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationEditPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
