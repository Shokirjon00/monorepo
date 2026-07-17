export interface IMerchantService {
  id: string;
  name?: string;
  merchantServiceParams: MerchantServiceParams[];
  posTypeName: string;
  merchantServiceName?: string;
  merchantId: string;
  posTypeId: string;
}

interface MerchantServiceParams {
  id: string;
  defaultValue: string;
  isReadOnly: boolean;
  isChecked: boolean;
  isToAccount: boolean;
  serviceParamName: string;
  serviceParamId: string;
}
