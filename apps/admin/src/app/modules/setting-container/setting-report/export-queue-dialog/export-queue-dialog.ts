import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DestroyableComponent} from '@eskhata/util';
import {Observable, takeUntil} from 'rxjs';
import {SvgIconComponent} from "angular-svg-icon";
import {ToastComponent} from "@eskhata/ui";
import {NgxPermissionsModule} from "ngx-permissions";
import {UploadLogoComponent} from "@shared/components/upload-logo/upload-logo.component";
import {IHttpResponse} from "@core/interfaces/http-response.interface";
import {SettingReportService} from "@modules/setting-container/setting-report/services/setting-report.service";
import {UploadItem} from "@modules/setting-container/setting-report/interfaces/setting-report.interface";
import {ISetting} from "@modules/setting-container/setting/interfaces/setting.interface";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-account-edit-dialog',
  templateUrl: './export-queue-dialog.html',
  styleUrls: ['./export-queue-dialog.scss'],
  providers: [SettingReportService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ToastComponent,
    NgxPermissionsModule,
    UploadLogoComponent
  ]
})
export class ExportQueueDialog extends DestroyableComponent implements OnInit {
  submitted: boolean;
  stampControl: FormGroup;
  fileStorageUrl: string;
  fileStorageToken: string;
  uploads: UploadItem[] = [
    {key: 'stamp', label: 'Штамп Банка \'Эсхата\''},
    {key: 'title', label: 'Титулка Отчета'}
  ];

  private dialogRef = inject(MatDialogRef<ExportQueueDialog>);
  private service = inject(SettingReportService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const group: any = {};
    this.uploads.forEach(u => group[u.key] = new FormControl(''));
    this.stampControl = new FormGroup(group);
    this.getDetail();
  }

  close(): void {
    this.dialogRef.close();
  }

  uploadLogo(file: FormData, key: string): Observable<IHttpResponse<ISetting>> {
    if (key === 'stamp') {
      return this.service.uploadStapm(file);
    } else if (key === 'title') {
      return this.service.uploadStapmTitle(file);
    }
  }

  getUploadFile(key: string) {
    return (file: FormData) => this.uploadLogo(file, key);
  }

  private getDetail(): void {
    this.service.getStamp(this.data.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.fileStorageUrl = res.meta?.fileStorageUrl;
          this.fileStorageToken = res.meta?.fileStorageToken;

          const stampValue = res.data?.shtampId;
          const titleValue = res.data?.titleId;

          if (stampValue) {
            this.stampControl.get('stamp')?.patchValue(stampValue);
          }

          if (titleValue) {
            this.stampControl.get('title')?.patchValue(titleValue);
          }
        }
      });
  }
}
