import {
  ICompanyRegistration
} from "@modules/company-registration/list-registration/interfaces/company-registration.interfaces";

export interface ICompanyRegistrationDetail extends ICompanyRegistration {
  id: string;
  number: string;
  companyName: string;
  companyNameLatin: string;
  inn: string;
  ein: string;
  address: string;
  applicantFullName: string;
  applicantPhoneNumber: string;
  companyRegistrationApplicationStatusName: string;
  companyRegistrationApplicationStatusId: string;
  innFileId: string;
  licenseFileId: string;
  passportFileId: string;
  taxStatementFileId: string;
  posTypeNames: string;
  activitySphere: string;
  managerName: string;
  merchants: { name: string; address: string; quantity: number }[];
}
