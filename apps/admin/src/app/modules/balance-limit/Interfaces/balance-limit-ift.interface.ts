export interface IBalanceLimitIFT {
  nrt: {
    amount: number;
    currentPositionAmount: number;
    currentBalanceAmount: number;
    accountNumber: string;
    currencyIsoName: string;
    lastRefreshDateTime: string;
    canEdit: boolean;
    canRefresh: boolean;
  },
  ift: {
    amount: number;
    currentPositionAmount: number;
    currentBalanceAmount: number;
    accountNumber: string;
    currencyIsoName: string;
    lastRefreshDateTime: string;
    canEdit: boolean;
    canRefresh: boolean;
  }
}
