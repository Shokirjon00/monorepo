export interface IAcquirerDetail {
  id?: string;
  name: string;
  extCodeEqms: string;
  inn: string;
  ein: string;
  bic: string;
  priority: string;
  correspondentAccountNumber: string;
  isActive?: boolean;
  statusName?: string;
}
