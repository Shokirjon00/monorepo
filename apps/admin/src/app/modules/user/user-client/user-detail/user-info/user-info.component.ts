import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { IUsers } from '@modules/user/user-client/interfaces/users.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientUsersService } from '@modules/user/user-client/services/client-users.service';
import { finalize, Observable } from 'rxjs';
import { IHeader } from '@core/interfaces/header.interface';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  providers: [ClientUsersService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    ToastComponent,
    EmHeaderComponent,
    DateTimePipe
  ]
})
export class UserInfoComponent implements OnInit {
  userDetail: IUsers;
  header: IHeader = {
    isFilter: false,
    tabShow: false
  };

  private readonly loading: WritableSignal<boolean> = signal(false);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly clientService = inject(ClientUsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clientUserId = this.activatedRoute.snapshot.parent.params['clientUserId'];
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.getClientUser();
  }

  navigateToUpdate(): void {
    this.router.navigate([`user/client/detail/${this.clientUserId}/edit`,])
      .catch()
  }

  showKey(): void {
    const dialogData = new ConfirmDialogModel(
      `На тел.номеру ${this.userDetail.phoneNumber} будет отправлены данные для входа`,
      '',
      '',
      false,
      'Отмена',
      'Отправить'
    );
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-modalbox'
    });
    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        let $observer: Observable<any>;
        if (this.userDetail.isShowResetPassword) {
          $observer = this.clientService.resetPassword({id: this.userDetail.id})
        } else if (this.userDetail.isShowSendFirstLoginData) {
          $observer = this.clientService.sendFirstLoginData({id: this.userDetail.id})
        }
        $observer
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(res => {
            this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message})
          })
      }

    });
  }

  private getClientUser(): void {
    this.loading.set(true);
    this.clientService.getClientUserById(this.clientUserId)
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
