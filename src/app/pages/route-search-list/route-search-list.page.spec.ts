import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteSearchListPage } from './route-search-list.page';

describe('RouteSearchListPage', () => {
  let component: RouteSearchListPage;
  let fixture: ComponentFixture<RouteSearchListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteSearchListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteSearchListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
