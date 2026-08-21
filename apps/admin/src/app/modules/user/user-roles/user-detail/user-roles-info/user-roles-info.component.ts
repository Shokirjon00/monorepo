import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { IUsers } from '@modules/user/user-client/interfaces/users.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable, takeUntil } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, ToastComponent } from '@eskhata/ui';
import { UsersRolesService } from "@modules/user/user-roles/services/users-roles.service";
import { MerchantService } from "@modules/client/merchant/services/merchant.service";
import { DateTimePipe } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-user-roles-info',
  templateUrl: './user-roles-info.component.html',
  styleUrls: ['./user-roles-info.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    ToastComponent,
    EmHeaderComponent,
    DateTimePipe
  ],
  providers: [
    UsersRolesService,
    MerchantService
  ]
})
export class UserRolesInfoComponent extends DestroyableComponent implements OnInit {
  userDetail: IUsers;
  loading: boolean;

  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly clientRolesService = inject(UsersRolesService);
  private readonly messageService = inject(MessageService);
  private clientUserId = this.activatedRoute.snapshot.parent.params['userRolesId'];


  ngOnInit(): void {
    this.getClientUser();
  }

  navigateToUpdate(): void {
    this.router.navigate([`user/client-roles/detail/${this.clientUserId}/edit`,])
      .catch()
  }

  showKey(): void {
    const dialogData = new ConfirmDialogModel(`На тел.номеру ${this.userDetail.phoneNumber}  будет отправлены данные для входа`, "", "");
    dialogData.cancelButtonText = 'Отмена';
    dialogData.successButtonText = 'Отправить';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-modalbox'
    });
    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        let $observer: Observable<any>;
        if (this.userDetail.isShowResetPassword) {
          $observer = this.clientRolesService.resetPassword({id: this.userDetail.id})
        } else if (this.userDetail.isShowSendFirstLoginData) {
          $observer = this.clientRolesService.sendFirstLoginData({id: this.userDetail.id})
        }
        $observer
          .pipe(takeUntil(this.destroyed$))
          .subscribe(res => {
            this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message})
          })
      }
    });
  }

  private getClientUser(): void {
    this.loading = true;
    this.clientRolesService.getClientUserById(this.clientUserId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.userDetail = res.data
      })
  }
}
