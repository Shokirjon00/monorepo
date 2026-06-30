import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable, takeUntil } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { Location } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { ToastModule } from '@shared/components/toast/toast.module';
import { UsersService } from '@modules/user-container/user/services/users.service';
import { IUsers } from '@modules/user-container/user/interfaces/users.interface';
import { IHeader } from '@core/interfaces';
import { HeaderService } from '@core/services/header.service';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';

@Component({
  standalone: true,
  selector: 'em-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  imports: [SvgIconComponent, NgxPermissionsAllowStubDirective, ToastModule, EmHeaderComponent],
})
export class UserInfoComponent extends DestroyableComponent implements OnInit {
  userDetail: IUsers;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false,
  };
  loading: boolean;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);
  private readonly location = inject(Location);
  private id = this.activatedRoute.snapshot.parent.params['userId'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getUser();
  }

  navigate(): void {
    this.router.navigate(['user', 'user', 'detail', this.id, 'edit']).catch();
  }

  showKey(): void {
    const dialogData = new ConfirmDialogModel(
      `На тел.номеру ${this.userDetail.phoneNumber}  будет отправлены данные для входа`,
      '',
      '',
      false,
      'Отмена',
      'Отправить'
    );
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        let $observer: Observable<any>;
        if (this.userDetail.isShowResetPassword) {
          $observer = this.usersService.resetPassword({ id: this.userDetail.id });
        } else if (this.userDetail.isShowSendFirstLoginData) {
          $observer = this.usersService.sendFirstLoginData({ id: this.userDetail.id });
        }
        $observer.pipe(takeUntil(this.destroyed$)).subscribe(res => {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
        });
      }
    });
  }

  back(): void {
    this.location.back();
  }

  private getUser(): void {
    this.loading = true;
    this.usersService
      .getUserById(this.id)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => (this.userDetail = res.data));
  }

  private initData(): void {
    this.headerService.setHeader(this.headerData);
  }
}
