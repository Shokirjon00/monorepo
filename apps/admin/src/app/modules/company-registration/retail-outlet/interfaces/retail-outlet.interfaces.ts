export interface IRetailOutlet {
  id: string;
  number: string;
  companyName: string;
  companyNameLatin: string;
  inn: string;
  applicantFullName: string;
  applicantPhoneNumber: string;
  companyRegistrationApplicationStatusName: string;
  companyRegistrationApplicationStatusId: string;
  innFileId: string;
  licenseFileId: string;
  passportFileId: string;
  statementFileId: string;
  taxStatementFileId: string
}

export interface IRetailOutletChangeStatus{
  id: string;
  merchantApplicationStatusId: string;
  comment: string;
}
