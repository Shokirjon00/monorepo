import {CashbackParamJson} from "@core/interfaces/cashback-param-json.interface";
import {ContractFilesJson} from "@core/interfaces/contract-files-json.interface";

export interface ICashback {
  id?: string;
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
  merchants: string[];
  createdAt?: string;
  modifiedAt?: string;
  statusName?: string;
  bankCashbackName: string;
  bankStartDate: string;
  bankEndDate: string;
  cashbackCompanyTypeName: string;
  companyName: string;
  userShortName: string;
  isActive: boolean;
}
