import {Component, Inject} from '@angular/core';
import {IUserProfile} from '@core/interfaces/user.interface';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {delay, mergeMap, takeUntil} from 'rxjs/operators';
import {DestroyableComponent} from '@core/abstract/destroyable.component';
import {UserService} from '@core/services/user.service';
import {HelperService} from '@core/services/helper.service';
import {AlertDialogComponent} from '@shared/dialogs/alert-dialog/alert-dialog.component';
import {MessageService} from '@core/services/message.service';
import {ToastEnum} from '@eskhata/util';
import {of} from 'rxjs';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {NgxPermissionsModule} from 'ngx-permissions';
import {ToastComponent} from '@shared/components/toast/toast.component';
import { HttpResponse } from "@angular/common/http";


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
  imports: [
    AngularSvgIconModule,
    NgxPermissionsModule,
    MatDialogModule,
    ToastComponent
  ],
  styleUrls: ['./user-profile-dialog.component.scss']
})
export class UserProfileDialogComponent extends DestroyableComponent {
  memType = '.png, .svg, .jpeg, .jpg';
  previews: IUploadField[] = [];
  selectedFiles?: File;
  avatarImg: any;


  constructor(
    private _dialog: MatDialog,
    public dialogRef: MatDialogRef<UserProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userProfile: IUserProfile,
    private adminUserService: UserService,
    private messageService: MessageService,
    private helperService: HelperService,
  ) {
    super();
    const host = userProfile.fileStorageUrl;
    const token = userProfile.fileStorageToken;
    const fileId = userProfile.photoFileId;
    this.getUploadAvatar(host, fileId, token);
  }

  onChangeFiles(event: any): void {
    this.selectedFiles = event.target.files[0];
    if ((this.selectedFiles.size / 1024 / 1024) > 5) {
      const title = `Файл(ы) ${this.selectedFiles.name} превышает допустимый лимит 5МБ`;
      this._dialog.open(AlertDialogComponent, {data: {title}, maxWidth: '90vw'})
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(this.selectedFiles.type)) {
      const title = 'Неподдерживаемый тип файла, загрузите только .jpg или .png'
      this._dialog.open(AlertDialogComponent, {data: {title}, maxWidth: '90vw'})
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

  private addFile(file: any): void {
    const formData = new FormData();
    formData.set('avatar', file);
    this.adminUserService.updateAvatar(formData)
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.getUploadAvatar(res.meta.fileStorageUrl, res.data, res.meta.fileStorageToken);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.errors['file.ContentType'][0]});
        }
      })
  }

  private getUploadAvatar(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (res: HttpResponse<Blob>) => this.createImageFromBlob(res.body))
  }

  private createImageFromBlob(image: Blob): void {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.avatarImg = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
