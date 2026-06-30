export interface IBankDetail {
  id?: string;
  name: string;
  extCodeAbs: string;
  extCodeEqms: string;
  bic: string;
  inn: string;
  ein: string;
  bicEqms: string;
  position?: number;
  priority?: number;
  correspondentAccountNumber: string;
  correspondentAccountNumberEqms: string;
  debitAccountAbsCode?: string;
  creditAccountAbsCode?: string;
  isActive?: boolean;
  canRefund?: boolean;
  canRefundName?: string;
  refund?: boolean;
  statusName?: boolean;
  address?: string;
  bankTypeName?: string;
  iconFileStorageId?: string;
}
