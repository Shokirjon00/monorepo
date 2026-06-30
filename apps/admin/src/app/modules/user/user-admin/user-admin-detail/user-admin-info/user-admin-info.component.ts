import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { IUsers } from '@modules/user/user-client/interfaces/users.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AdminUsersService } from '@modules/user/user-client/services/admin-users.service';
import { IHeader } from '@core/interfaces/header.interface';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { CommonModule } from "@angular/common";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import { ConfirmDialogComponent, ConfirmDialogModel } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MessageService } from "@core/services";
import { MatDialog } from "@angular/material/dialog";
import { ToastEnum } from "@core/enums/toast-enum";

@Component({
  standalone: true,
  selector: 'em-user-admin-info',
  templateUrl: './user-admin-info.component.html',
  styleUrls: ['./user-admin-info.component.scss'],
  providers: [AdminUsersService],
  imports: [
    CommonModule,
    NgxPermissionsModule,
    SvgIconComponent,
    DateTimePipe,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class UserAdminInfoComponent implements OnInit {
  userDetail: IUsers;
  header: IHeader = {
    isFilter: false,
    tabShow: false
  };

  private readonly loading: WritableSignal<boolean> = signal(false);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly adminService = inject(AdminUsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminUserId = this.activatedRoute.snapshot.parent.params['adminUserId'];
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.getAdminUser();
  }

  navigateToUpdate(): void {
    this.router.navigate([`user/admin/detail/${this.adminUserId}/edit`,]).catch();
  }

  showKey(): void {
    const dialogData = new ConfirmDialogModel(`На эл.почту ${this.userDetail.email}  будут отправлены данные для входа`, '', '', false, 'Отмена', 'Отправить');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        let observable: Observable<any>;
        if (this.userDetail.isShowResetPassword) {
          observable = this.adminService.resetPassword({id: this.userDetail.id})
        } else if (this.userDetail.isShowSendFirstLoginData) {
          observable = this.adminService.sendFirstLoginData({id: this.userDetail.id})
        }
        observable
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(res => {
            this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message})
          })
      }
    });
  }

  private getAdminUser(): void {
    this.loading.set(true);
    this.adminService.getAdminUserById(this.adminUserId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.userDetail = res.data;
        }
      })
  }

}
