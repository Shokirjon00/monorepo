export interface ICompany {
  codeMap: string;
  createdDateTime: string;
  updatedDateTime: string;
  id: string;
  fullName: string;
  name: string;
  internationalName: string;
  address: string;
  inn: string;
  ein: string;
  isActive: boolean;
  isSelected: boolean;
  isManuallySelected: boolean;
}

export interface ISearchClient{
  inn: string;
  name: string;
  extCodeAbs: string;
}
