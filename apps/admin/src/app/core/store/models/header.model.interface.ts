import {IPaginate} from '@eskhata/util';
import {IHeader} from '@eskhata/util';
import {IAction} from '@eskhata/util';

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
