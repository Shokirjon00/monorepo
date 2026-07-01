import { Component, inject, OnInit } from '@angular/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SvgIconComponent } from 'angular-svg-icon';
import { IUsers } from '@modules/user-container/user/interfaces/users.interface';
import { Location } from '@angular/common';
import { IHeader } from '@core/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '@core/services/message.service';
import { HeaderService } from '@core/services/header.service';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { finalize, Observable, takeUntil } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ToastEnum } from '@eskhata/util';
import { ToastModule } from '@shared/components/toast/toast.module';
import { PosTerminalService } from '@modules/user-container/pos-terminal/services/pos-terminal.service';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';

@Component({
  selector: 'em-pos-terminal-info',
  standalone: true,
  imports: [SvgIconComponent, ToastModule, NgxPermissionsModule, EmHeaderComponent],
  templateUrl: './pos-terminal-info.component.html',
  styleUrl: './pos-terminal-info.component.scss',
})
export class PosTerminalInfoComponent extends DestroyableComponent implements OnInit {
  userDetail: IUsers;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false,
  };
  loading: boolean;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly posTerminalService = inject(PosTerminalService);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);
  private readonly location = inject(Location);
  private id = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getPosTerminal();
  }

  navigate(): void {
    this.router.navigate(['user/pos-terminal/edit', this.id]).catch();
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
        this.processUserAction();
      }
    });
  }

  private processUserAction(): void {
    let $observer: Observable<any>;

    if (this.userDetail.isShowResetPassword) {
      $observer = this.posTerminalService.resetPassword({ id: this.userDetail.id });
    } else if (this.userDetail.isShowSendFirstLoginData) {
      $observer = this.posTerminalService.sendFirstLoginData({ id: this.userDetail.id });
    }

    $observer.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      this.messageService.add({
        severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
        summary: res.message,
      });
    });
  }

  back(): void {
    this.location.back();
  }

  private getPosTerminal(): void {
    this.loading = true;
    this.posTerminalService
      .getPosTerminalById(this.id)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.userDetail = res.data;
        }
      });
  }

  private initData(): void {
    this.headerService.setHeader(this.headerData);
  }
}
