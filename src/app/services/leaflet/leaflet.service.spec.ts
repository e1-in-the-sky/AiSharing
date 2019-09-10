import { TestBed } from '@angular/core/testing';

import { LeafletService } from './leaflet.service';

describe('LeafletService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeafletService = TestBed.get(LeafletService);
    expect(service).toBeTruthy();
  });
});
