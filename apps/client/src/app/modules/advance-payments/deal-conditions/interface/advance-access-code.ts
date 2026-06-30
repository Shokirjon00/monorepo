export interface IAdvanceAccessCode {
  id: string;
  advancePayoutId: string;
  resendIntervalSeconds: number;
  maskedPhoneNumber: number;
}
