import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFilterPage } from './map-filter.page';

describe('MapFilterPage', () => {
  let component: MapFilterPage;
  let fixture: ComponentFixture<MapFilterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapFilterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
