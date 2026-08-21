import { Component, DestroyRef, inject } from '@angular/core';
import { IUserProfile } from '@core/interfaces/user.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@core/services/user.service';
import { HelperService } from '@eskhata/data-access';
import { AlertDialogComponent } from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum } from '@eskhata/util';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HttpResponse } from '@angular/common/http';
import { ToastModule } from '@eskhata/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface IUploadField {
  img: any;
  status: 'success' | 'error' | 'progress';
  imgName: string;
  imgId?: string;
}

@Component({
  standalone: true,
  selector: 'em-user-profile-dialog',
  templateUrl: './user-profile-dialog.component.html',
  imports: [AngularSvgIconModule, NgxPermissionsModule, MatDialogModule, ToastModule],
  styleUrls: ['./user-profile-dialog.component.scss'],
})
export class UserProfileDialogComponent {
  memType = '.png, .svg, .jpeg, .jpg';
  previews: IUploadField[] = [];
  selectedFiles?: File;
  avatarImg: any;

  private _dialog = inject(MatDialog);

  readonly dialogRef =
    inject<MatDialogRef<UserProfileDialogComponent>>(MatDialogRef);

  readonly userProfile = inject<IUserProfile>(MAT_DIALOG_DATA);

  private readonly adminUserService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly helperService = inject(HelperService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const host = this.userProfile.fileStorageUrl;
    const token = this.userProfile.fileStorageToken;
    const fileId = this.userProfile.photoFileId;
    this.getUploadAvatar(host, fileId, token);
  }

  onChangeFiles(event: any): void {
    this.selectedFiles = event.target.files[0];
    if (this.selectedFiles.size / 1024 / 1024 > 5) {
      const title = `Файл(ы) ${this.selectedFiles.name} превышает допустимый лимит 5МБ`;
      this._dialog.open(AlertDialogComponent, { data: { title }, maxWidth: '90vw' });
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(this.selectedFiles.type)) {
      const title = 'Неподдерживаемый тип файла, загрузите только .jpg или .png';
      this._dialog.open(AlertDialogComponent, { data: { title }, maxWidth: '90vw' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any): void => {
      this.previews.push(e.target.result);
    };
    reader.readAsDataURL(this.selectedFiles);
    this.addFile(this.selectedFiles);
    event.target.value = null;
  }

  private addFile(file: File): void {
    const formData = new FormData();
    formData.set('avatar', file);

    this.adminUserService
      .updateAvatar(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        let message = res.message;

        if (!res.status && res.errors) {
          const firstErrorKey = Object.keys(res.errors)[0];
          message = res.errors[firstErrorKey][0];
        }

        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: message
        });

        if (res.status) {
          this.getUploadAvatar(
            res.meta.fileStorageUrl,
            res.data,
            res.meta.fileStorageToken
          );
        }
      });
  }

  private getUploadAvatar(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService
      .getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (res: HttpResponse<Blob>) => this.createImageFromBlob(res.body));
  }

  private createImageFromBlob(image: Blob): void {
    let reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.avatarImg = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
