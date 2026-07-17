import {ContractFilesJson} from '@modules/bank-promotion/interfaces/contract-files-json.interface';
import {CashbackParamJson} from '@modules/bank-promotion/interfaces/cashback-param-json.interface';

export interface IBankPromotion {
  id?: string;
  bankCashbackId?: string;
  bankCashbackName?: string;
  bankStartDate: string;
  bankEndDate: string;
  cashbackLimitId?: string;
  cashbackAmountOver?: string;
  cashabackLimitName: string;
  cashbackAccrualTypeId: string;
  cashbackAccrualTypeName?: string;
  description:string;
  createdAt?: string;
  modifiedAt?: string;
  statusName?: string;
  isActive: boolean;
  cashbackLimitNoMore: string;
  cashbackParamJson?: CashbackParamJson;
  contractFilesJson?: ContractFilesJson[];
  purposeCashbackTypeId?: string;
  purposeCashbackTypeName?: string;
}
