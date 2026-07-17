import {
  Component,
  EventEmitter,
  OnChanges,
  Output, signal,
  SimpleChanges,
  TemplateRef,
  input, Input,
  viewChild,
  inject
} from '@angular/core';
import {AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {AlertDialogComponent} from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { MemTypeEnum, FileStatusEnum, ToastEnum } from '@eskhata/util';
import {CompanyService} from '@modules/client/company/services/company.service';
import {DestroyableComponent} from '@core/abstract/destroyable.component';
import {HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';
import {IHttpResponse} from '@core/interfaces/http-response.interface';
import {takeUntil} from 'rxjs';
import {HelperService} from '@core/services/helper.service';
import {MessageService} from '@core/services/message.service';
import {PdfDialogComponent} from '@shared/dialogs/pdf-dialog/pdf-dialog.component';
import {printFile} from '@core/utils/print-file';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {SharedModule} from '@shared/shared.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import {ImageDialogComponent} from "@shared/dialogs/image-dialog/image-dialog.component";

interface IUploadField {
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

@Component({
  standalone: true,
  selector: 'em-upload-field',
  templateUrl: './upload-field.component.html',
  styleUrls: ['./upload-field.component.scss'],
  imports: [
    SharedModule,
    AngularSvgIconModule,
    NgxPermissionsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UploadFieldComponent
    }
  ]
})
export class UploadFieldComponent extends DestroyableComponent implements ControlValueAccessor, OnChanges {
  readonly uploadConfirmDialog = viewChild<TemplateRef<any>>('uploadConfirmDialog');
  @Input() fileStorageUrl: string;
  @Input() fileId: any;
  @Input() fileStorageToken: string;
  readonly readOnly = input<boolean>();
  readonly canPrint = input<boolean>(true);
  readonly uploadPath = input<string>();
  readonly fileLimit = input<number>();
  readonly control = input<AbstractControl>();
  readonly memType = input<string>();
  readonly permissionName = input<string>();
  readonly fileTypes = input<string[]>([]);
  readonly templatePermissionName = input<string>();
  readonly formStyle = input<string>("square");
  readonly placeHolder = input('Загрузить документ PDF <br> не более 5 МБ');
  readonly showOnlyUploadButton = input<boolean>(false);
  readonly fieldType = input<string>('');
  readonly useFileValidation = input<boolean>(false);

  @Input() fieldName: string = '';
  @Input() fieldIndex: number = 0;
  @Input() instanceId: string = '';

  @Output() deactivateFileIds = this.register(new EventEmitter());
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFileUploaded = new EventEmitter<{fileId: string, fieldName: string, fieldIndex: number}>();

  files: IUploadField[] = [];
  type = MemTypeEnum;
  img = MemTypeEnum;
  loading = signal(false);
  limitExceeded: boolean;

  private cachedFileStorageUrl: string;
  private cachedFileStorageToken: string;
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  private readonly numericIdRegex = /^\d+$/;
  private readonly storageIdRegex = /^[a-zA-Z0-9\-_]+$/;
  private readonly fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  private readonly extensionToMimeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };

  private readonly companyService = inject(CompanyService);
  private readonly dialog = inject(MatDialog);
  private readonly helperService = inject(HelperService);
  private readonly messageService = inject(MessageService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileStorageUrl']) {
      this.cachedFileStorageUrl = changes['fileStorageUrl'].currentValue;
    }
    if (changes['fileStorageToken']) {
      this.cachedFileStorageToken = changes['fileStorageToken'].currentValue;
    }
  }

  onChange = (_: string[]): void => {};
  onTouched = (): void => {};

  deleteFile(event: Event, file: IUploadField, index: number): void {
    this.files[index].status = 'progress';
    this.files[index].progressPercent = 0;
    this.deleteFormFile(event, file, index);
    event.stopPropagation();
  }

  deleteFormFile(event: Event, file: IUploadField, index: number): void {
    const item = this.files[index];
    if (item) {
      item.showStatus = false;
      item.statusId = FileStatusEnum.DEACTIVATE;
    }
    this.emitFileChanges();
    event.stopPropagation();
    this.limitExceeded = this.files.filter(item => item.showStatus).length >= this.fileLimit();
  }

  retryUpload(file: IUploadField, i: number): void {
    this.addFile(file.file, i);
  }

  triggerFileInput(): void {
    const fileInput = this.getFileInput();
    if (fileInput) {
      fileInput.click();
    }
  }

  onChangeFiles(event: any): void {
    const data = this.files.filter(item => item.statusId === FileStatusEnum.CREATED);

    if (data.length >= this.fileLimit()) {
      const title = 'Превышен лимит загрузки файла';
      this.messageService.add({severity: ToastEnum.WARN, summary: title});
      return;
    }

    const files = event.target.files as FileList;
    const errorFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!this.isAllowedFile(file)) {
        this.messageService.add({severity: ToastEnum.WARN, summary: 'Недопустимый тип файла'});
        return;
      }

      if ((file.size / 1024 / 1024) > 5) {
        errorFiles.push(file.name);
      } else {
        this.addFile(file);
      }
    }

    this.limitExceeded = this.files.filter(item => item.showStatus).length >= this.fileLimit();

    if (errorFiles.length) {
      const title = `Файл(ы) ${errorFiles.join(', ')} превышает допустимый лимит 5МБ`;
      this.dialog.open(AlertDialogComponent, {
        data: {title},
        maxWidth: '600px'
      });
    }
    event.target.value = null;
  }

  writeValue(value: any): void {
    setTimeout(() => {
      this.files = [];
      this.loading.set(false);

      if (!value || (Array.isArray(value) && value.length === 0)) {
        return;
      }

      if (this.readOnly()) {
        this.handleReadOnlyValue(value);
      } else {
        if (this.useFileValidation()) {
          this.handleValidatedValue(value);
        } else {
          this.handleUnvalidatedValue(value);
        }
      }
    }, 0);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  IsPdf(fileType: string): boolean {
    return fileType === 'application/pdf';
  }

  isImage(fileType: string): boolean {
    return fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg';
  }

  showDocument(data: IUploadField): void {
    if (this.readOnly() && !data.blob && data.id) {
      this.loading.set(true);
      this.loadFileById(data.id, () => {
        this.loading.set(false);
        const loadedFile = this.files.find(f => f.id === data.id);
        if (loadedFile && loadedFile.blob) {
          this.displayFile(loadedFile);
        }
      });
      return;
    }

    this.displayFile(data);
  }

  printDocument(): void {
    this.companyService.getContractTemplate()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res && res.meta && res.data) {
          this.getDocumentFile(res.meta.fileStorageUrl, res.data.contractTemplateId, res.meta.fileStorageToken);
        }
      });
  }

  private getFileInput(): HTMLInputElement | null {
    return document.querySelector(`#fileInput_${this.instanceId}`) as HTMLInputElement;
  }

  private displayFile(data: IUploadField): void {
    const openDocument = (dataUrl: string) => {
      if (data.fileType?.startsWith('image/')) {
        this.getImageDialog(dataUrl);
      } else if (data.fileType === 'application/pdf') {
        this.getPdfDialog(dataUrl);
      } else {
        const fileName = data.fileName || 'document';
        this.downloadDataUrl(dataUrl, fileName);
      }
    };

    if (data.blob) {
      this.readFileAsDataUrl(data.blob, openDocument);
      return;
    }

    if (typeof data.file === 'string' && data.file.startsWith('data:')) {
      openDocument(data.file);
      return;
    }

    if (data.file instanceof File) {
      this.readFileAsDataUrl(data.file, openDocument);
      return;
    }

    if (data.file) {
      openDocument(data.file);
    }
  }

  private readFileAsDataUrl(file: Blob | File, callback: (dataUrl: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e: any) => callback(e.target.result);
    reader.readAsDataURL(file);
  }

  private handleReadOnlyValue(value: any): void {
    const fileIds = this.normalizeToArray(value);

    if (fileIds.length) {
      this.processFileIds(fileIds);
    }

    this.updateLimitExceeded(fileIds.length);
  }

  private handleValidatedValue(value: any): void {
    if (!this.isValidFileId(value)) {
      return;
    }

    const fileIds = this.normalizeToArray(value);
    const validFileIds = this.filterValidFileIds(fileIds);

    if (validFileIds.length === 0) {
      return;
    }

    this.processFileIds(validFileIds);
    this.onChange(validFileIds);
  }

  private handleUnvalidatedValue(value: any): void {
    if (!this.hasRequiredStorageData()) {
      return;
    }

    const fileIds = this.normalizeToArray(value);
    if (fileIds.length === 0) {
      return;
    }

    this.processFileIds(fileIds);
    this.onChange(fileIds);
  }

  private hasRequiredStorageData(): boolean {
    return !!(this.cachedFileStorageUrl && this.cachedFileStorageToken);
  }

  private normalizeToArray(value: any): any[] {
    return Array.isArray(value) ? value : [value];
  }

  private filterValidFileIds(fileIds: any[]): string[] {
    return fileIds.filter(id => this.isValidFileId(id));
  }

  private processFileIds(fileIds: any[]): void {
    if (!fileIds || fileIds.length === 0) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.updateLimitExceeded(fileIds.length);

    let loadedCount = 0;

    fileIds.forEach((fileId: string) => {
      this.loadFileById(fileId, () => {
        loadedCount++;
        if (loadedCount === fileIds.length) {
          this.loading.set(false);
        }
      });
    });
  }

  private updateLimitExceeded(currentCount: number): void {
    this.limitExceeded = currentCount >= this.fileLimit();
  }

  private isUuid(value: string): boolean {
    return this.uuidRegex.test(value);
  }

  private isNumericId(value: string): boolean {
    return this.numericIdRegex.test(value);
  }

  private isStorageId(value: string): boolean {
    return value.length >= 8 && this.storageIdRegex.test(value);
  }

  private isValidFileId(value: any): boolean {
    if (this.fieldType() !== 'file' || !value) {
      return false;
    }

    const id = String(value).trim();

    if (!id) {
      return false;
    }

    return (
      this.isUuid(id) ||
      this.isNumericId(id) ||
      this.isStorageId(id)
    );
  }

  private loadFileById(fileId: string, onComplete: () => void): void {
    this.helperService.getFile(this.cachedFileStorageUrl, fileId, this.cachedFileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.processFileResponse(res, fileId, onComplete));
  }

  private processFileResponse(res: any, fileId: string, onComplete: () => void): void {
    const fileType = this.extractContentType(res);
    const filename = this.extractFilename(res) || 'file';
    const blob = new Blob([res.body], { type: fileType });

    this.readFileAsDataUrl(blob, (dataUrl) => {
      const safeName = this.ensureFilenameExtension(filename, fileType);
      this.updateFileEntry(fileId, {
        file: dataUrl,
        blob,
        fileName: safeName,
        fileType,
        status: 'success',
        statusId: FileStatusEnum.CREATED,
        showStatus: true
      });
      onComplete();
    });
  }

  private extractContentType(res: any): string {
    const contentType = res.headers.get('content-type');
    return contentType ? contentType.split(';')[0] : 'application/octet-stream';
  }

  private extractFilename(res: any): string | null {
    const contentDisposition = res.headers.get('content-disposition');
    if (!contentDisposition) return null;

    const matches = this.fileNameRegex.exec(contentDisposition);
    if (matches?.[1]) {
      const encoded = matches[1].replace(/['"]/g, '');
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    }
    return null;
  }

  private updateFileEntry(fileId: string, data: Partial<IUploadField>): void {
    const index = this.files.findIndex(f => f.id === fileId);
    const entry: IUploadField = { id: fileId, ...data };

    if (index >= 0) {
      this.files[index] = { ...this.files[index], ...entry };
    } else {
      this.files.push(entry);
    }
  }

  private downloadDataUrl(dataUrl: string, filename: string): void {
    let finalFilename = filename;
    if (!finalFilename.includes('.')) {
      if (this.IsPdf(filename)) {
        finalFilename += '.pdf';
      } else if (this.isImage(filename)) {
        finalFilename += '.jpg';
      } else {
        finalFilename += '.docx';
      }
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private ensureFilenameExtension(name: string, mime: string | null): string {
    if (!name) return name;
    const hasExt = /\.[a-z0-9]+$/i.test(name);
    if (hasExt) return name;

    const map: Record<string, string> = this.extensionToMimeMap;
    const ext = (mime && map[mime]) ? map[mime] : '';
    return ext ? `${name}.${ext}` : name;
  }

  private addFile(file: any, fileIndex?: number): void {
    const formData = new FormData();
    formData.set('file', file);
    const fileData: IUploadField = {
      file,
      fileName: file.name,
      fileType: file.type,
      status: 'progress',
      progressPercent: 0,
      showStatus: true,
    };

    if (typeof fileIndex === 'number') {
      this.files[fileIndex] = { ...fileData };
    } else {
      fileIndex = this.files.push({ ...fileData }) - 1;
    }

    this.companyService
      .addFile(formData, this.uploadPath())
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (httpEvent: HttpEvent<IHttpResponse<any>>) => this.handleUploadEvent(httpEvent, fileIndex));
  }

  private handleUploadEvent(
    httpEvent: HttpEvent<IHttpResponse<any>>,
    fileIndex: number
  ): void {
    if (fileIndex === undefined || !this.files[fileIndex]) return;

    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.files[fileIndex].progressPercent = Math.round((httpEvent.loaded / httpEvent.total) * 100);
        break;

      case HttpEventType.Response:
        this.handleUploadSuccess(httpEvent, fileIndex);
        break;
    }
  }

  private handleUploadSuccess(
    httpEvent: HttpResponse<any>,
    fileIndex: number
  ): void {
    const body = httpEvent.body as any;
    const file = this.files[fileIndex];

    if (body?.data?.id) {
      const fileId = body.data.id;

      Object.assign(file, {
        status: 'success' as const,
        id: fileId,
        statusId: FileStatusEnum.CREATED,
        showStatus: true
      });

      this.onFileUploaded.emit({
        fileId: fileId,
        fieldName: this.fieldName,
        fieldIndex: this.fieldIndex
      });

      this.emitFileChanges();
    } else {
      Object.assign(file, {
        status: 'error' as const,
        showStatus: true
      });
      this.control()?.setErrors({ typeNotSupported: true });
      const msg = body?.message || 'Ошибка загрузки файла';
      this.messageService.add({ severity: ToastEnum.ERROR, summary: msg });
    }
    this.onTouched();
  }

  private getDocumentFile(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: HttpResponse<Blob>) => printFile(res.body));
  }

  private emitFileChanges(): void {
    const arrayCreated: any = [];
    const arrayDeactivate: any = [];

    this.files.forEach(item => {
      if (item.statusId === FileStatusEnum.CREATED) {
        arrayCreated.push(item.id);
      } else {
        arrayDeactivate.push(item.id);
      }
    });

    if (this.fileLimit() === 1) {
      const fileId = arrayCreated[0];
      this.onChange(fileId);

      if (fileId) {
        this.onFileUploaded.emit({
          fileId: fileId,
          fieldName: this.fieldName,
          fieldIndex: this.fieldIndex
        });
      }
    } else {
      this.onChange(arrayCreated);
    }

    this.deactivateFileIds.emit(arrayDeactivate);
  }

  private getPdfDialog(data: string): void {
    this.dialog.open(PdfDialogComponent, {
      data: data,
      panelClass: 'custom-modalbox'
    });
  }

  private getImageDialog(data: string): void {
    this.dialog.open(ImageDialogComponent, {
      data: data,
      panelClass: 'custom-modalbox'
    });
  }

  private isAllowedFile(file: File): boolean {
    const allowed = this.fileTypes() || [];
    if (file.type && allowed.includes(file.type)) return true;

    const name = file.name || '';
    const extMatch = name.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (!extMatch) return false;

    const ext = extMatch[1];
    const map: Record<string, string[]> = {
      'pdf': ['application/pdf'],
      'png': ['image/png'],
      'jpg': ['image/jpeg', 'image/jpg'],
      'jpeg': ['image/jpeg', 'image/jpg'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const possibleTypes = map[ext] || [];
    return possibleTypes.some(t => allowed.includes(t));
  }
}
