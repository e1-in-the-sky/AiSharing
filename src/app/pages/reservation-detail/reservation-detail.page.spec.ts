import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationDetailPage } from './reservation-detail.page';

describe('ReservationDetailPage', () => {
  let component: ReservationDetailPage;
  let fixture: ComponentFixture<ReservationDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
