import {ICommissionGradations} from '@modules/directory/commission/interfaces/commission-gradations.interface';

export class ICommission{
  id?:string;
  name: string;
  startDate: string;
  endDate: string;
  statusName?: string;
  commissionGradations?: ICommissionGradations[];
}
