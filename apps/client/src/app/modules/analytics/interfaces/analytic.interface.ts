import { IKeyValue } from "@core/interfaces/key-value.interface";

export interface IPaymentCount {
  dashboardData: IKeyValue[];
  total: number;
}

export interface IPaymentStatus {
  count: number;
  statusName: string;
  statusType: string;
}

export interface IPaymentPosType {
  paymentsByPosTypeCount: IPaymentsByPosTypeCount[];
  posTypeMarkers: IPaymentsByPosTypeName[];
  total: number;
}

export interface IAveragePayment {
  averageSum: number
}

export interface IAnalyticParams {
  dateFilterTypeId?: string;
  merchantId?: string;
  posId?: string;
  posTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface IPaymentsByPosTypeCount {
  count: number;
  posTypeId: string | any;
}

export interface IPaymentsByPosTypeName{
  name: string;
  posTypeId: string | any;
}
