import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChipComponent } from './user-chip.component';

describe('UserChipComponent', () => {
  let component: UserChipComponent;
  let fixture: ComponentFixture<UserChipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserChipComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
