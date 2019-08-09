import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MypageEditPage } from './mypage-edit.page';

describe('MypageEditPage', () => {
  let component: MypageEditPage;
  let fixture: ComponentFixture<MypageEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MypageEditPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MypageEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
