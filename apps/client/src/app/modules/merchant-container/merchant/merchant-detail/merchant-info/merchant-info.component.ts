import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { IMerchantDetail } from '../../interfaces/merchant-detail.interface';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { HeaderService } from '@core/services/header.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { HelperService } from '@core/services/helper.service';
import { loadFile } from '@core/utils/load-file';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { SharedModule } from '@shared/shared.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ToastModule } from '@shared/components/toast/toast.module';
import { CompanyInfoService } from '@modules/merchant-container/company-info/services/company-info.service';
import { IAction } from '@shared/components/actions/action.interface';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { ITab } from '@core/interfaces';
import { PosConstants } from '@modules/merchant-container/pos/pos.constants';
import { MerchantConstants } from '@modules/merchant-container/merchant/merchant.constants';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MerchantInfoMobileCardComponent } from '@modules/merchant-container/merchant/merchant-detail/merchant-info-mobile-card/merchant-info-mobile-card.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'em-merchant-info',
  templateUrl: './merchant-info.component.html',
  styleUrls: ['./merchant-info.component.scss'],
  imports: [
    SharedModule,
    EskhataBankLoaderComponent,
    ToastModule,
    EmHeaderComponent,
    ActionsComponent,
    MerchantInfoMobileCardComponent,
    SvgIconComponent,
  ],
  providers: [CompanyInfoService],
})
export class MerchantInfoComponent implements OnInit {
  merchantDetail: IMerchantDetail;
  loading: boolean;
  imgLoginMain: string;
  imgLogoDetail: string;
  imgLogoList: string;
  tabMenuItems: ITab[];
  actions: IAction[] = [];

  private merchantId: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(MerchantService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly headerService = inject(HeaderService);
  private readonly helperService = inject(HelperService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.initData();
    this.getDetail();
  }

  private initData(): void {
    this.getIds();
    this.headerService
      .getIntegrationStatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (!res) {
          this.tabMenuItems = PosConstants.getHeaderTabsIds(this.merchantId);
        } else {
          this.tabMenuItems = PosConstants.getPosHeader(this.merchantId);
        }
      });
  }

  private getIds(): void {
    this.headerService
      .getMerchantId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(merchantId => (this.merchantId = merchantId));
  }

  private getDetail(): void {
    this.breadcrumbService.set('@merchantDetail', { skip: true });
    this.loading = true;
    this.service
      .getDetail(this.merchantId)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.merchantDetail = res.data;
          this.breadcrumbService.set('@merchantDetail', { label: this.merchantDetail.name, skip: false });
          if (this.merchantDetail.imgLoginMain)
            this.getUploadLoginMain(
              res.meta.fileStorageUrl,
              this.merchantDetail.imgLoginMain,
              res.meta.fileStorageToken
            );
          if (this.merchantDetail.imgLogoDetail)
            this.getUploadLogoDetail(
              res.meta.fileStorageUrl,
              this.merchantDetail.imgLogoDetail,
              res.meta.fileStorageToken
            );
          if (this.merchantDetail.imgLogoList)
            this.getUploadLogoList(res.meta.fileStorageUrl, this.merchantDetail.imgLogoList, res.meta.fileStorageToken);
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      });
  }

  back(): void {
    this.router.navigate(['merchant/merchant']).catch();
  }

  private getUploadLoginMain(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService
      .getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (res: any) => (this.imgLoginMain = await loadFile(res.body)));
  }

  private getUploadLogoDetail(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService
      .getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (res: any) => (this.imgLogoDetail = await loadFile(res.body)));
  }

  private getUploadLogoList(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService
      .getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (res: any) => (this.imgLogoList = await loadFile(res.body)));
  }
}
