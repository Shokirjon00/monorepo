import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { SmsService } from "@modules/sms-notification/promotion-system/service/sms.service";
import { ISMS } from "@modules/sms-notification/promotion-system/interface/sms.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { IAction } from "@shared/components/actions/actions.interface";
import {
  PromotionSystemInfoConstants
} from "@modules/sms-notification/promotion-system/promotion-system-info/promotion-system-info.constants";

@Component({
  standalone: true,
  selector: 'em-promotion-system-info',
  templateUrl: './promotion-system-info.component.html',
  styleUrls: ['./promotion-system-info.component.scss'],
  imports: [
    AngularSvgIconModule,
    NgxPermissionsModule,
    ToastComponent,
    ActionsComponent,
    EmHeaderComponent
  ],
  providers: [SmsService]
})
export class PromotionSystemInfoComponent extends DestroyableComponent implements OnInit {
  info: ISMS;
  loading = signal(false);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly adminService = inject(SmsService)
  notificationId = this.activatedRoute.snapshot.params['id'];
  actions: IAction[] = PromotionSystemInfoConstants.getActions(this.notificationId)

  ngOnInit(): void {
    this.getSystemAlertInfo();
  }

  formatTime(timeString: string): string {
    if (!timeString) return '-';

    const components = timeString.split(':');
    const formattedTime = components
      .map((component, index) => index === 2 ? component : this.padZero(component))
      .join(':');
    return formattedTime;
  }

  private padZero(num: string): string {
    const parsed = parseInt(num, 10);
    if (isNaN(parsed)) return num; // Если значение не является числом, возвращаем исходное значение
    return parsed < 10 ? `0${parsed}` : num;
  }

  private getSystemAlertInfo(): void {
    this.loading.set(true);
    this.adminService.getSmsNotificationDetail(this.notificationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.info = res.data)
  }
}
