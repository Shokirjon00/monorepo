export interface IUploadField {
  file?: any;
  status?: 'success' | 'error' | 'progress';
  fileName?: string;
  id?: string;
  fileType?: string;
  statusId?: string;
  progressPercent?: number;
  showStatus?: boolean;
  blob?: Blob;
}
