import { TestBed } from '@angular/core/testing';

import { RetailOutletStateService } from './retail-outlet-state.service';

describe('RetailOutletStateService', () => {
  let service: RetailOutletStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetailOutletStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
