import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, finalize, takeUntil } from 'rxjs';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { IMerchantDetail } from '@modules/client/merchant/interfaces/merchant-detail.interface';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { loadFile } from '@core/utils/load-file';
import { HelperService } from '@eskhata/data-access';
import { ToastEnum } from '@eskhata/util';
import { MigrationOfOutletsComponent } from "@modules/client/pos/migration-of-outlets/migration-of-outlets.component";
import { MatDialog } from "@angular/material/dialog";
import { MessageService } from '@eskhata/data-access';
import { DateTimePipe } from '@eskhata/util';
import { SharedModule } from "@shared/shared.module";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ActionsComponent, EmHeaderComponent } from '@eskhata/ui';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { MerchantInfoConstants } from "@modules/client/merchant/merchant-detail/merchant-info/merchant-info.constants";
import { PosTerminalsConstants } from "@modules/client/pos-terminal/pos-terminals.constants";

@Component({
  standalone: true,
  selector: 'em-merchant-info',
  templateUrl: './merchant-info.component.html',
  styleUrls: ['./merchant-info.component.scss'],
  providers: [MerchantService],
  imports: [
    DateTimePipe,
    SharedModule,
    EbLoaderComponent,
    EmHeaderComponent,
    ActionsComponent,
    ]
})
export class MerchantInfoComponent extends DestroyableComponent implements OnInit {
  merchantId: string;
  companyId: string;
  merchantDetail: IMerchantDetail;
  tabMenuItems: ITab[];
  actions: IAction[];
  loading: boolean;
  imgLoginMain: string;
  imgLogoDetail: string;
  imgLogoList: string;

  private store = inject(HeaderService)
  private helperService = inject(HelperService)
  private merchantService = inject(MerchantService)
  private dialog = inject(MatDialog)
  private messageService = inject(MessageService)
  private route = inject(ActivatedRoute)
  private posRoute: string = this.route.snapshot.parent.parent.params['merchantId'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getDetail();
    this.store.getDialog()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res === 'migration') {
          this.setMigrateForNewIssue();
        }
      });
  }

  setMigrateForNewIssue(): void {
    this.loading = true;
    this.merchantService.migrateForNewIssue(this.posRoute)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res) {
          this.migrateForNewIssue(res.data);
          this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message || 'Миграция успешно запущена!'});
        }
      });
  }

  migrateForNewIssue(migration: any): void {
    this.dialog.open(MigrationOfOutletsComponent, {
      data: migration,
      disableClose: true,
      panelClass: 'custom-modalbox',
      maxWidth: 1000
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.store.setDialog(null);
      });
  }

  private initData(): void {
    combineLatest([
      this.store.getCompanyId(),
      this.store.getMerchantId()
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([companyId, merchantId]) => {
        this.companyId = companyId;
        this.merchantId = merchantId;
        this.updateMenuAndActions();
      });
  }

  private updateMenuAndActions(): void {
    if (this.companyId) {
      this.actions = MerchantInfoConstants.getAction(this.companyId, this.merchantId);
      this.tabMenuItems = PosTerminalsConstants.getPosHeaderTabs(this.companyId, this.merchantId);
    } else {
      this.tabMenuItems = PosTerminalsConstants.getPosHeader(this.merchantId);
      this.actions = MerchantInfoConstants.getActionMerchant(this.merchantId);
    }
  }

  private getDetail(): void {
    this.loading = true
    this.merchantService.getDetail(this.merchantId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        this.merchantDetail = res.data;
        if (this.merchantDetail.imgLoginMain) this.getUploadLoginMain(res.meta.fileStorageUrl, this.merchantDetail.imgLoginMain, res.meta.fileStorageToken);
        if (this.merchantDetail.imgLogoDetail) this.getUploadLogoDetail(res.meta.fileStorageUrl, this.merchantDetail.imgLogoDetail, res.meta.fileStorageToken);
        if (this.merchantDetail.imgLogoList) this.getUploadLogoList(res.meta.fileStorageUrl, this.merchantDetail.imgLogoList, res.meta.fileStorageToken);
      })
  }

  private getUploadLoginMain(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (res: any) => this.imgLoginMain = await loadFile(res.body))
  }

  private getUploadLogoDetail(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (res: any) => this.imgLogoDetail = await loadFile(res.body))
  }

  private getUploadLogoList(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (res: any) => this.imgLogoList = await loadFile(res.body))
  }
}
