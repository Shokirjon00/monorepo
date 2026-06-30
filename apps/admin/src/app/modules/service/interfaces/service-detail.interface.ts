export interface IServiceDetail {
  id?: string;
  name: string;
  code?: string;
  createdAt: string,
  modifiedAt: string,
  createdByName: string,
  modifiedByName: string,
  statusName: boolean,
  isActive?: boolean;
  extCodeAbs: string;
  extCodeProcessing: string;
  gatewayId: string;
  gatewayName: string;
  position: number;
  commissionValue: number;
  minValue: number;
  maxValue: number;
  iconId: string;
}
