export interface IUploadField {
  file?: File;
  status?: 'success' | 'error' | 'progress';
  fileName?: string;
  id?: string;
  statusId?: string;
  progressPercent?: number;
  showStatus?: boolean;
  fileType?: string;
}
