import { signal } from '@angular/core';
import { IBanner } from "@shared/components/banner/interface/banner";

export const bannerAmountSignal = signal<IBanner>({
  amount: null,
  isAdvancePayoutsExist: true,
  isBannerVisible: true,
});
