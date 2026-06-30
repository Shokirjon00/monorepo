export interface ISettingReport {
  createdAt: string;
  createdByName: string;
   isActive: boolean;
  modifiedByName: string;
  name: string;
  templateFileId: string;
  id: string;
  modifiedAt: string
}

export interface UploadItem {
  key: string;
  label: string;
}
