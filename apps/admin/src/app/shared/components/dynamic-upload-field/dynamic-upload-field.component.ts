import {
  Component,
  input,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  output, inject, DestroyRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { takeUntil } from 'rxjs';
import { FileStatusEnum } from '@core/enums/file-status-enum';
import { HelperService } from '@core/services/helper.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { AlertDialogComponent } from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { CompanyService } from '@modules/client/company/services/company.service';
import {IDynamicUploadField} from "@shared/components/dynamic-upload-field/dynamic-upload-field";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export type UploadFieldMode = 'isSingleMode' | 'dynamic' | 'isViewMode';

@Component({
  standalone: true,
  selector: 'em-dynamic-upload-field',
  templateUrl: './dynamic-upload-field.component.html',
  styleUrls: ['./dynamic-upload-field.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    AngularSvgIconModule,
    NgxPermissionsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DynamicUploadFieldComponent
    }
  ]
})
export class DynamicUploadFieldComponent implements ControlValueAccessor, OnChanges {
  @Input() fileStorageUrl: string;
  @Input() fileStorageToken: string;
  @Input() mode: UploadFieldMode = 'isSingleMode';
  @Input() label: string = '';
  @Input() readOnly = false;
  readonly uploadPath = input<string>();
  readonly fileTypes = input<string[]>(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
  readonly fileLimit = input<number>(1);
  readonly placeholder = input<string>('Загрузить файл');
  readonly memType = input<string>();

  filesChange = output<string[]>();
  files: IDynamicUploadField[] = [];
  form: FormGroup;
  isDragOver = false;
  hasExistingFilesFromServer = false;
  loading = signal(false);

  private cachedFileStorageUrl: string;
  private cachedFileStorageToken: string;
  private readonly companyService= inject(CompanyService);
  private readonly helperService= inject(HelperService);
  private readonly messageService= inject(MessageService);
  private readonly _dialog= inject(MatDialog);
  private readonly fb= inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  onChange = (_: any): void => {};

  onTouched = (): void => {};

  constructor() {
    this.form = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileStorageUrl']) {
      this.cachedFileStorageUrl = changes['fileStorageUrl'].currentValue;
    }
    if (changes['fileStorageToken']) {
      this.cachedFileStorageToken = changes['fileStorageToken'].currentValue;
    }
  }

  writeValue(value: any): void {
    setTimeout(() => {
      if (!this._isValidValue(value)) {
        this.hasExistingFilesFromServer = false;
        return;
      }

      this._initFiles();
      const validFileIds = this._normalizeValue(value);

      this._setHasExistingFiles(validFileIds);

      this._loadFilesFromServer(validFileIds);

      this.onChange(value);
    }, 0);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChangeFiles(event: any): void {
    const activeFiles = this.files.filter(item => item.showStatus);
    const createdFiles = activeFiles.filter(item => item.statusId === FileStatusEnum.CREATED);

    if (createdFiles.length >= this.fileLimit()) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Перевышен лимит загрузки файлов'
      });
      return;
    }

    const files = event.target.files as FileList;
    this._processFiles(files);
    event.target.value = null;
    this._updateFormValue();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files as FileList;
    if (files && files.length > 0) {
      this._processFiles(files);
      this._updateFormValue();
    }
  }

  deleteFile(event: Event, file: IDynamicUploadField, index: number): void {
    this.files[index].showStatus = false;
    this.files[index].statusId = FileStatusEnum.DEACTIVATE;
    this._updateFormValue();
    event.stopPropagation();
  }

  isPdf(fileType: string): boolean {
    return fileType === 'application/pdf';
  }

  isImage(fileType: string): boolean {
    return fileType?.startsWith('image/');
  }

  downloadFile(event: Event, file: IDynamicUploadField): void {
    event.stopPropagation();

    if (file.id && file.status === 'success' && this.cachedFileStorageUrl && this.cachedFileStorageToken) {
      this._downloadFromServer(file);
    } else if (file.file) {
      this._downloadLocal(file);
    }
  }

  private _processFiles(files: FileList): void {
    const errorFiles: string[] = [];
    const MAX_FILE_SIZE_MB = 25;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errorFiles.push(file.name);
      } else {
        this._addFile(file);
      }
    }

    if (errorFiles.length) {
      const title = `Файл(ы) ${errorFiles.join(', ')} превышает допустимый лимит ${MAX_FILE_SIZE_MB}МБ`;
      this._dialog.open(AlertDialogComponent, {
        data: { title },
        maxWidth: '600px'
      });
    }
  }

  private _isValidValue(value: string): string {
    return value && this.cachedFileStorageUrl && this.cachedFileStorageToken;
  }

  private _initFiles(): void {
    this.files = [];
    this.loading.set(true);
  }

  private _normalizeValue(value: any): any[] {
    const fileIds = Array.isArray(value) ? value : [value];
    return fileIds.filter(f => f);
  }

  private _setHasExistingFiles(validFileIds: any[]): void {
    if (validFileIds.length > 0 && this.mode === 'dynamic') {
      this.hasExistingFilesFromServer = true;
    }
  }

  private _loadFilesFromServer(fileIds: any[]): void {
    let loadedCount = 0;

    fileIds.forEach(fileId => {
      this.helperService.getFile(this.cachedFileStorageUrl, fileId, this.cachedFileStorageToken)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          this._processServerFile(res, fileId);

          loadedCount++;
          if (loadedCount === fileIds.length) {
            this.loading.set(false);
          }
        });
    });
  }

  private _processServerFile(res: any, fileId: string): void {
    const blob = new Blob([res.body], { type: 'application/pdf' });
    const filename = this._extractFileName(res.headers.get('content-disposition'));
    const fileType = this._extractFileType(res.headers.get('content-type'));

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = (): void => {
      this.files.push({
        file: reader.result,
        id: fileId,
        statusId: FileStatusEnum.CREATED,
        showStatus: true,
        fileName: filename,
        fileType: fileType,
        status: 'success'
      });
      this._dedupeFiles();
    };
  }

  private _extractFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;

    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      const encodedFilename = matches[1].replace(/['"]/g, '');
      return decodeURIComponent(encodedFilename);
    }
    return null;
  }

  private _extractFileType(contentType: string | null): string | null {
    return contentType ? contentType.split(';')[0] : null;
  }

  private _downloadFromServer(file: IDynamicUploadField): void {
    this.helperService.getFile(this.cachedFileStorageUrl, file.id, this.cachedFileStorageToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {

        const blob = res.body;
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName || `file_${file.id}`;
        link.click();

        URL.revokeObjectURL(url);

      }, () => {
        this.messageService.add({
          severity: ToastEnum.ERROR,
          summary: 'Ошибка скачивания файла'
        });
      });
  }

  private _downloadLocal(file: IDynamicUploadField): void {
    if (!file?.file) return;

    const link = document.createElement('a');
    const fileName = file.fileName || 'file';

    if (typeof file.file === 'string') {
      link.href = file.file;
    } else if (file.file instanceof Blob) {
      link.href = URL.createObjectURL(file.file);
    } else {
      return;
    }

    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (file.file instanceof Blob) {
      URL.revokeObjectURL(link.href);
    }
  }

  private _addFile(file: any): void {
    const formData = new FormData();
    const fileData: IDynamicUploadField = {
      file,
      fileName: file.name,
      fileType: file.type,
      status: 'progress',
      progressPercent: 0,
      showStatus: true,
      statusId: FileStatusEnum.CREATED
    };

    formData.set('file', file);

    const fileIndex = this.files.push(fileData) - 1;

    this.companyService
      .addFile(formData, this.uploadPath())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((httpEvent: HttpEvent<IHttpResponse<any>>) => {
        switch (httpEvent.type) {
          case HttpEventType.UploadProgress:
            if (httpEvent.total) {
              this.files[fileIndex].progressPercent = Math.round(
                (100 * httpEvent.loaded) / httpEvent.total
              );
            }
            break;

          case HttpEventType.Response:
            if (httpEvent.body?.status) {
              this.files[fileIndex].status = 'success';
              this.files[fileIndex].id = httpEvent.body.data.id;
              this._dedupeFiles();
              this.messageService.add({
                severity: ToastEnum.SUCCESS,
                summary: 'Файл успешно загружен'
              });
            } else {
              this.files[fileIndex].status = 'error';
              this.messageService.add({
                severity: ToastEnum.ERROR,
                summary: 'Ошибка загрузки файла'
              });
            }
            break;
        }
        this._updateFormValue();
      },
      () => {
        this.files[fileIndex].status = 'error';
        this.messageService.add({
          severity: ToastEnum.ERROR,
          summary: 'Ошибка загрузки файла'
        });
        this._updateFormValue();
      });
  }

  private _updateFormValue(): void {
    const activeFilesRaw = this.files
      .filter(item => item.showStatus && item.id)
      .map(item => item.id);
    const activeFiles = Array.from(new Set(activeFilesRaw));

    if (this.mode === 'isSingleMode') {
      const value = activeFiles.length > 0 ? activeFiles[0] : null;
      this.onChange(value);
    } else if (this.mode === 'dynamic') {
      this.onChange(activeFiles);
      this.filesChange.emit(activeFiles);
    }
  }

  private _dedupeFiles(): void {
    const seen = new Set<string>();
    const unique: IDynamicUploadField[] = [];
    for (const f of this.files) {
      if (f && f.id) {
        if (!seen.has(f.id)) {
          seen.add(f.id);
          unique.push(f);
        }
      } else {
        unique.push(f);
      }
    }
    this.files = unique;
  }
}
