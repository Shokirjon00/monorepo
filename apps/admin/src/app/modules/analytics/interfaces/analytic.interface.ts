import {IKeyValue} from '@core/interfaces/key-value.interface';

export interface IPaymentCount {
  dashboardData: IKeyValue[];
  total: number;
}

export interface IPaymentTest {
  all?: any;
  incoming?: any;
  outgoing?: any;
  dashboardData: IKeyValue[];
  total: number;
}
export interface IPaymentStatus {
  count: number;
  statusName: string;
  statusType: string;
}

export interface IPaymentPosType {
  paymentsByPosTypeCount: [{
    count: number;
    posTypeId: string;
  }]
  posTypeMarkers: [{
    name: string;
    posTypeId: string;
  }]
  total: number;
}

export interface IAveragePayment {
  averageSum: number
}
