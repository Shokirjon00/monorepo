export interface IBank {
  bic: string;
  correspondentAccountNumber: string;
  extCodeAbs: string;
  id: string;
  isActive: boolean;
  name: string;
  position: number;
  priority: number;
  statusName: string;
  address: string;
}

export interface IBankIntegration {
  id?: string,
  bankName?: string,
  bankId: string,
  webhookUrl: string,
  privateKey?: string,
  apiKey?: string,
  networkAddresses: string[],
  externalApiAccessTypeId?: string
}
