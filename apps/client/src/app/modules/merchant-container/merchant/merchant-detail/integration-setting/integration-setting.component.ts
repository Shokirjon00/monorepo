import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { IntegrationService } from '@modules/merchant-container/merchant/services/integration.service';
import { takeUntil } from 'rxjs';
import { HeaderService } from '@eskhata/data-access';
import { finalize } from 'rxjs/operators';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { ClipboardService } from 'ngx-clipboard';
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, EskhataBankLoaderComponent, ToastModule } from '@eskhata/ui';
import { ITab } from "@core/interfaces";
import { PosConstants } from "@modules/merchant-container/pos/pos.constants";

@Component({
  standalone: true,
  selector: 'em-integration-setting',
  templateUrl: './integration-setting.component.html',
  styleUrls: ['./integration-setting.component.scss'],
  imports: [
    SvgIconComponent,
    EskhataBankLoaderComponent,
    ToastModule,
    EmHeaderComponent
  ]
})
export class IntegrationSettingComponent extends DestroyableComponent implements OnInit {
  hashKey: string;
  isOpen: boolean = false;
  submitted: boolean = false;
  tabMenuItems: ITab[];
  private merchantId: string;
  private integrationService = inject(IntegrationService);
  private headerService = inject(HeaderService);
  private messageService = inject(MessageService);
  private clipboardService = inject(ClipboardService);

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getIntegrationKey();
  }

  getIntegrationKey(): void {
    this.submitted = true;
    this.integrationService.getMerchantIntegration(this.merchantId)
      .pipe(
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res: any) => {
        if (res.status) {
          this.hashKey = res.data.hashKey;
        }
      })
  }

  copyHashKey(): void {
    this.clipboardService.copy(this.hashKey);
    this.messageService.add({severity: ToastEnum.SUCCESS, summary: 'Ключ хеширования скопирован!'});
  }

  private initData(): void {
    this.headerService.getMerchantId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchantId => this.merchantId = merchantId)
    this.tabMenuItems = PosConstants.getPosHeader(this.merchantId);
  }
}
