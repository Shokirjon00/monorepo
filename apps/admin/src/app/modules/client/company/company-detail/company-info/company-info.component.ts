import {Component, DestroyRef, inject, Input, OnInit, signal} from '@angular/core';
import {CompanyService} from '../../services/company.service';
import {ICompanyDetail} from '../../interfaces/company-detail.interface';
import {HeaderService} from '@core/services/header.service';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  ChoosePhoneNumberDialogComponent
} from '@modules/client/company/company-detail/choose-phone-number-dialog/choose-phone-number-dialog';
import {MatDialog} from '@angular/material/dialog';
import {ToastEnum} from '@eskhata/util';
import {MessageService} from '@core/services/message.service';
import {DateTimePipe} from "@core/pipe/date-time.pipe";
import {UploadFieldComponent} from "@shared/components/upload-field/upload-field.component";
import {ToastComponent} from "@shared/components/toast/toast.component";
import {EmHeaderComponent} from "@shared/components/em-header/em-header.component";
import {ActionsComponent} from "@shared/components/actions/actions.component";
import {IAction} from "@shared/components/actions/actions.interface";
import {ITab} from "@core/interfaces/header.interface";
import {MerchantConstants} from "@modules/client/merchant/merchant.constants";
import {CompanyInfoConstants} from "@modules/client/company/company-detail/company-info/company-info.constants";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {finalize} from "rxjs";

@Component({
  standalone: true,
  selector: 'em-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
  providers: [CompanyService],
  imports: [
    DateTimePipe,
    ReactiveFormsModule,
    UploadFieldComponent,
    ToastComponent,
    EmHeaderComponent,
    ActionsComponent
  ]
})
export class CompanyInfoComponent implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'companies/upload'
  };
  companyId: string;
  actions: IAction[];
  tabMenuItems: ITab[];
  loading = signal(false);
  companyDetail: ICompanyDetail;
  form: FormGroup;
  fileStorageUrl: string;
  fileStorageToken: string;
  private fb = inject(FormBuilder);
  private service = inject(CompanyService);
  private store = inject(HeaderService);
  private dialog = inject(MatDialog);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.initTabData();
  }

  ngOnInit(): void {
    this.form = this.fb.group({contractFiles: ''});
    this.getDetail();
    this.store.getDialog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res === 'telegram-notification') {
          this.sendTelegramLink();
        }
      });
  }

  sendTelegramLink(): void {
    const dialogExist = this.dialog.getDialogById('telegram-notification');
    if (dialogExist) return;
    this.dialog.open(ChoosePhoneNumberDialogComponent, {
      disableClose: true,
      width: '500px',
      panelClass: 'custom-modalbox',
      data: {companyId: this.companyId}
    })
      .afterClosed().subscribe(message => {
      if (message) {
        this.messageService.add({severity: ToastEnum.SUCCESS, summary: message});
      }
      this.store.setDialog(null);
    });
  }

  syncWithIft(): void {
    if (!this.companyId) return;
    this.loading.set(true);
    this.service.syncWithIft({companyId: this.companyId})
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message});
        this.getDetail();
      })
  }

  private getDetail(): void {
    this.service.getDetail(this.companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.companyDetail = res.data;
        this.fileStorageUrl = res.meta.fileStorageUrl;
        this.fileStorageToken = res.meta.fileStorageToken;
        this.form.patchValue(res.data, {emitEvent: false})
      })
  }

  private initTabData(): void {
    this.store.getCompanyId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(companyId => {
        this.companyId = companyId;
        if (this.companyId) {
          this.getTabItems();
        }
      })
  }

  private getTabItems(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.tabMenuItems = res ? MerchantConstants.getHeaderAcquirerTabs(this.companyId) : MerchantConstants.getHeaderTabs(this.companyId);
        this.actions = CompanyInfoConstants.getAction(this.companyId);
      });
  }
}
