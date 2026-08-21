import {ICompanyDetail} from '@modules/client/company/interfaces/company-detail.interface';

export interface IJobLog {
  id: string;
  finishedDateTime: string;
  jobLogTypeName: string;
  statusName: string;
}

export interface IJobLogInfo {
  id: string
  finishedDateTime: string;
  jobLogTypeName: string;
  statusName: string;
  createdAt: string;
  modifiedAt: string;
  allowedTryCount: number;
  request: string;
  response: string;
  session: string;
  paymentId: string;
  errorMessage?: string;
}

export interface IJobLogData {
  id: string;
  status: 0 | 1;
  allowedTryCount: number;
  finishedDateTime?: string;
  response?: {
    companies: ICompanyDetail[],
    stateMessage: string;
  };
  state?: number;
  stateMessage: string
}
