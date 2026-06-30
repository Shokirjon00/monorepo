import {CashbackParamJson} from '@modules/bank-promotion/interfaces/cashback-param-json.interface';
import {ContractFilesJson} from '@modules/bank-promotion/interfaces/contract-files-json.interface';

export interface ICashbackCompany {
  id?: string;
  bankCashbackId?: string;
  bankCashbackName?: string;
  bankStartDate: string;
  bankEndDate: string;
  companyCashbackId?: string;
  companyCashbackName?: string;
  companyStartDate: string;
  companyEndDate: string;
  cashbackAccrualTypeId?: string;
  cashbackAccrualTypeName?: string;
  companyId?: string;
  cashbackParamJson: CashbackParamJson;
  description: string;
  contractFilesJson: ContractFilesJson[];
  merchants: any[];
  createdAt?: string;
  modifiedAt?: string;
  statusName?: string;
  isActive: boolean;
}
