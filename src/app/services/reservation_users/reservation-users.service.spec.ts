import { TestBed } from '@angular/core/testing';

import { ReservationUsersService } from './reservation-users.service';

describe('ReservationUsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReservationUsersService = TestBed.get(ReservationUsersService);
    expect(service).toBeTruthy();
  });
});
