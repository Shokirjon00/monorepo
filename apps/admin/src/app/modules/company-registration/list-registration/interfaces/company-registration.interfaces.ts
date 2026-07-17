export interface ICompanyRegistration {
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
  taxStatementFileId: string;
  comment?: string;
  comments?: { id: string; text: string; createdAt: string; createdById?: string; createdBy?: string }[];
  managerId?: string;
  fileIds?: string[];
  companyLegalFormId?: string;
}
