import { TestBed } from '@angular/core/testing';

import { AccountIconService } from './account-icon.service';

describe('AccountIconService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountIconService = TestBed.get(AccountIconService);
    expect(service).toBeTruthy();
  });
});
