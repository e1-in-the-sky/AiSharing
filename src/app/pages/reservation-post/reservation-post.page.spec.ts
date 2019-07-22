import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationPostPage } from './reservation-post.page';

describe('ReservationPostPage', () => {
  let component: ReservationPostPage;
  let fixture: ComponentFixture<ReservationPostPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationPostPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationPostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
