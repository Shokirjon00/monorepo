import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CompanyInfoService } from '@modules/merchant-container/company-info/services/company-info.service';
import { ChoosePhoneNumberDialogComponent } from '@modules/merchant-container/pos/pos-detail/choose-phone-number-dialog/choose-phone-number-dialog.component';
import { HeaderService } from '@core/services/header.service';
import { ICompanyInfo } from '@modules/merchant-container/company-info/interfaces/company-info.interface';
import { MemTypeEnum } from '@core/enums/mem-type.enum';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { IAction } from '@shared/components/actions/action.interface';
import { ToastEnum } from '@core/enums/toast-enum';
import { ToastModule } from '@shared/components/toast/toast.module';
import { ReactiveFormsModule } from '@angular/forms';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { MerchantConstants } from '@modules/merchant-container/merchant/merchant.constants';
import { CompanyInfoConstants } from '@modules/merchant-container/company-info/company-info.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'em-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
  imports: [ToastModule, ReactiveFormsModule, EmHeaderComponent, ActionsComponent],
  providers: [CompanyInfoService],
})
export class CompanyInfoComponent implements OnInit {
  @Input() uploadFile = {
    fileType: MemTypeEnum.img,
    memType: 'application/pdf',
    uploadPath: 'companies/upload',
  };
  tabMenuItems = MerchantConstants.HEADER_TABS;
  loading: boolean;
  companyInfo: ICompanyInfo;
  actions: IAction[] = CompanyInfoConstants.COMPANY_INFO_ACTION;
  readonly leftProperties = CompanyInfoConstants.companyProperties.slice(0, 7);
  readonly rightProperties = CompanyInfoConstants.companyProperties.slice(7);

  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(CompanyInfoService);
  private readonly messageService = inject(MessageService);
  private readonly store = inject(HeaderService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.getDetail();
    this.sendToTelegram();
  }

  sendTelegramLink(): void {
    if (!this.companyInfo) {
      this.showError('Данные компании ещё загружаются. Повторите попытку позже.');
      return;
    }

    if (this.dialog.getDialogById('telegram-notification')) {
      return;
    }

    this.dialog
      .open(ChoosePhoneNumberDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        data: { companyId: this.companyInfo.id },
        id: 'telegram-notification',
      })
      .afterClosed()
      .subscribe(message => {
        if (message) this.showSuccess(message);
      });
  }

  private sendToTelegram(): void {
    this.store
      .getDialog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res === 'telegram-notification') {
          this.sendTelegramLink();
        }
      });
  }

  private showError(summary: string): void {
    this.messageService.add({ severity: ToastEnum.ERROR, summary });
  }

  private showSuccess(summary: string): void {
    this.messageService.add({ severity: ToastEnum.SUCCESS, summary });
  }

  private getDetail(): void {
    this.service
      .getCompanyInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.companyInfo = res.data;
        }
      });
  }
}
