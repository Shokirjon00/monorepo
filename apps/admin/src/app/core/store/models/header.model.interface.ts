import {IPaginate} from '@core/interfaces/paginate.interface';
import {IHeader} from '@core/interfaces/header.interface';
import {IAction} from '@shared/components/actions/actions.interface';

export interface IHeaderModel{
  page: IPaginate;
  pageChanged: IPaginate;
  data: IHeader;
  action: IAction[];
  companyId: string;
  merchantId: string;
  posId: string;
  dialogAction: string;
  tableItemIds: string[];
}
