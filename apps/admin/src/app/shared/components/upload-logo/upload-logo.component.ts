import { Component, TemplateRef, input, Input, inject, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, Observable, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { loadFile } from '@core/utils/load-file';
import { AlertDialogComponent } from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum } from '@eskhata/util';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastComponent } from '@eskhata/ui';
import { PreloaderComponent } from '@shared/components/preloader/preloader.component';
import { HelperService } from '@eskhata/data-access';

interface IUploadField {
  img: any;
  status?: 'success' | 'error' | 'progress';
  imgName?: string;
  imgId?: string;
}

@Component({
  standalone: true,
  selector: 'em-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.scss'],
  imports: [
    AngularSvgIconModule,
    ToastComponent,
    PreloaderComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UploadLogoComponent
    }
  ]
})
export class UploadLogoComponent extends DestroyableComponent {
  readonly uploadConfirmDialog = viewChild<TemplateRef<any>>('uploadConfirmDialog');
  @Input() fileStorageUrl: string;
  @Input() fileId: any;
  @Input() fileStorageToken: string;
  readonly readOnly = input<boolean>();
  readonly cancel = input<boolean>(true);
  readonly action = input<string>();
  readonly imgLabel = input<string>();
  readonly uploadFile = input<(file: FormData) => Observable<any>>();
  readonly formDataKey = input<string>('');

  memType = '.png, .svg, .jpeg, .jpg';
  img: string;
  selectedFiles?: File;
  selectedFileNames: string[] = [];
  progressInfos: any[] = [];
  message: string[] = [];
  preview: IUploadField;
  loading: boolean = false;

  private readonly _dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);
  private readonly helperService = inject(HelperService);

  onChangeFiles(event: Event | any): void {
    this.loading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files[0];
    if ((this.selectedFiles.size / 1024 / 1024) > 2) {
      const title = `Файл(ы) ${this.selectedFiles.name} превышает допустимый лимит 2МБ`;
      this._dialog.open(AlertDialogComponent, {data: {title}, maxWidth: '600px'})
      this.loading = false;
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(this.selectedFiles);
    this.selectedFileNames = event.target.files.name;
    this.addFile(this.selectedFiles);
    event.target.value = null;
  }

  onChange = (_: any): void => {
  };
  onTouched = (): void => {
  };

  writeValue(value: any): void {
    setTimeout(() => {
      const fileStorageUrl = this.fileStorageUrl;
      const fileStorageToken = this.fileStorageToken;
      if (!value || !fileStorageUrl || !fileStorageToken) {
        return;
      }
      this.helperService.getFile(fileStorageUrl, value, fileStorageToken)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(async (res: any) => this.preview = await loadFile(res.body));
    }, 0)

  }

  deleteLogo(): void {
    this.preview = null;
    this.onChange('');
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  private addFile(file: any): void {
    const formData = new FormData();
    formData.set(this.formDataKey(), file);
    this.uploadFile()(formData)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (res.meta && res.meta.fileStorageUrl && res.meta.fileStorageToken) {
            this.fileStorageUrl = res.meta?.fileStorageUrl;
            this.fileStorageToken = res.meta?.fileStorageToken;
          }
          this.onChange(res.data.id);
          this.helperService.getFile(this.fileStorageUrl, res.data.id, this.fileStorageToken)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(async (response: any) => {
              this.preview = await loadFile(response.body);
            });
        } else {
          let errorMessage = res.message;

          if (res.errors) {
            const errors = Object.values(res.errors)
              .flat()
              .join(', ');

            errorMessage = errors || res.message;
          }

          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: errorMessage
          });
        }
      });
  }
}
