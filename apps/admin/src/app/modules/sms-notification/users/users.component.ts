import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { MessageService } from "@core/services/message.service";
import { ToastEnum } from '@eskhata/util';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ClickOutsideModule } from "@core/directives/click-outside/click-outside.module";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { UsersService } from "@modules/sms-notification/users/service/users.service";
import { ISmsNotification } from "@modules/sms-notification/users/interface/users";
import { IMessage } from "@core/interfaces/message.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { UserConstants } from "@modules/sms-notification/users/user.constants";

@Component({
  standalone: true,
  selector: 'em-register-balance',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  providers: [UsersService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    FormsModule,
    SimpleSelectListComponent,
    ClickOutsideModule,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    ReactiveFormsModule
]
})
export class UsersComponent extends DestroyableComponent implements OnInit {
  smsDetail: ISmsNotification = {
    messageText: ''
  };
  loading = signal(false);
  open: boolean;
  selectedPriority: any;
  submitted: boolean = false;
  tabMenuItems = UserConstants.HEADER_TABS;

  private readonly messageService = inject(MessageService);
  private readonly service = inject(UsersService);

  ngOnInit(): void {
    this.getNotifications();
  }

  onSubmit(): void {
    if (!this.smsDetail.messageText) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Текст сообщения не должен быть пустым'});
      return;
    }
    this.service.create(this.smsDetail)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        if (!res.status && res.errors?.messengers) {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.errors.messengers[0]});
        }
      })
  }


  clearValue(): void {
    this.selectedPriority = '';
    if (this.smsDetail.messageSendingPriorities) {
      this.smsDetail.messageSendingPriorities.forEach(item => item.isSelected = false);
    }
  }

  selectOperator(item: IMessage): void {
    if (this.smsDetail.mobileOperators) {
      this.smsDetail.mobileOperators.forEach((mobile: IMessage) => mobile.isSelected = false);
    }
    item.isSelected = !item.isSelected;
  }

  selectPriority(message: IMessage): void {
    this.clearValue();
    this.selectedPriority = message;
    message.isSelected = true;
  }

  private getNotifications(): void {
    this.service.getDetail()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.smsDetail = res.data;
          this.selectedPriority = this.smsDetail?.messageSendingPriorities.find(item => item.isSelected) || '';
        }
      });
  }

}
