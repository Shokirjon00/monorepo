export interface IAccountHistory {
  accountNumber: string;
  balanceBefore: number;
  amount: number;
  accountTransactionTypeName: string;
  accountOperationTypeName: string;
  createdAt: string;
  modifiedAt?: string;
}
