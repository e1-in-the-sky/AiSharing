import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteSearchPage } from './route-search.page';

describe('RouteSearchPage', () => {
  let component: RouteSearchPage;
  let fixture: ComponentFixture<RouteSearchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteSearchPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
