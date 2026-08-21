import { DestroyableComponent } from '@eskhata/util';
import { Component, inject, OnInit } from '@angular/core';
import { delay, finalize, Observable, of, Subject, takeUntil } from "rxjs";
import { HeaderService } from '@eskhata/data-access';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IMerchants, IWithdrawalAmountSettingDetail } from "@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting-detail.interface";
import { MatDialog } from "@angular/material/dialog";
import { Params } from "@angular/router";
import { WithdrawSetService } from "@modules/withdrawal-amount/withdrawal-amount-setting/services/withdrawal-amount-setting.service";
import { MerchantService } from "@modules/merchant-container/merchant/services/merchant.service";
import { mergeMap } from "rxjs/operators";
import { ISelect } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { DatePipe, Location } from "@angular/common";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IHeader } from '@eskhata/util';
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ToastEnum } from '@eskhata/util';
import { WithdrawalAmountSettingsDialogComponent } from "@shared/dialogs/withdrawal-amount-settings-dialog/withdrawal-amount-settings-dialog.component";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { IssueMoneySettingsValidator } from "@core/validators/settings-validator";
import { AlertDialogComponent } from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { SvgIconComponent } from "angular-svg-icon";
import { SimpleSelectListComponent, ToastModule, ValidatorModule } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-setting',
  templateUrl: './withdrawal-amount-setting.component.html',
  styleUrls: ['./withdrawal-amount-setting.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsAllowStubDirective,
    FormsModule,
    ValidatorModule,
    ToastModule,
    SimpleSelectListComponent
],
  providers:[
    WithdrawSetService,
    MerchantService
  ]
})
export class WithdrawalAmountSettingComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  periodTypes: ISelect[];
  settings: IWithdrawalAmountSettingDetail;
  merchants: ISelect[];
  headerData: IHeader = {
    tabs: [
      {
        label: 'Вывод средств',
        path: 'info',
        permissionName: 'IssueMoneyRegistryList'
      },
      {
        label: 'Настройки вывода',
        path: 'setting',
        permissionName: 'IssueMoneySettingUpdate'
      }
    ],
    paginationHide: true,
    isFilter: false,
    tabShow: true,
  };
  submitted: boolean = false;
  isMerchantSame: boolean;
  isTimeSame: boolean;
  isTermsSame: boolean;
  params: Params = {};
  private canDeactivate$ = new Subject<boolean>();
  readonly permissionService = inject(NgxPermissionsService);
  private readonly datePipe = inject(DatePipe);
  private readonly location = inject(Location);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(WithdrawSetService);
  private readonly headerService = inject(HeaderService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  constructor() {
    super();
    this.createForm();
    this.initData()
  }

  get merchantsFormArray(): FormArray {
    return this.form.get('merchants') as FormArray;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get merchantsFormControlsArray(): FormGroup[] {
    return this.merchantsFormArray.controls as FormGroup[];
  }

  ngOnInit(): void {
    this.getPeriodTypes();
    this.getSettingDetail();
  }

  initData(): void {
    this.headerService.setAction([{}])
    this.headerService.setPage(null);
    this.headerService.setHeader(this.headerData);
  }

  onSubmit(): void {
    this.merchantsFormControlsArray.forEach((c) => c.markAllAsTouched());

    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: "Неправильно заполнены данные!"});
      return null;
    }
    this.submitted = true;

    let clonedArray = [...this.form.controls['merchants'].value]; // will clone the array
    let merchants = clonedArray.filter(item => item.isActive);

    const body = {
      id: this.form.get('id').value,
      merchants: merchants,
      isActive: this.form.get('isActive').value
    }

    let $observer: Observable<IHttpResponse<IWithdrawalAmountSettingDetail>>;

    $observer = this.service.create(body);

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
          if (res.errors?.requestError) {
            this.messageService.add({severity: ToastEnum.WARN, summary: res.errors.requestError[0]});
          }
          if (res.errors.merchants) {
            let title = res.errors.merchants[0];
            this.dialog.open(AlertDialogComponent, {data: {title}, maxWidth: '90vw'})
          }
        }
      });
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: "custom-modalbox",
      data: {
        title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '90vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  back(): void {
    this.location.back();
  }

  changeSameMerchant(): void {
    this.settings?.merchants.forEach((item, index) => {
      this.merchantsFormArray.at(index).get('isActive').setValue(this.isMerchantSame)
    });
  }

  changeMerchant(merchant: AbstractControl): void {
    this.isMerchantSame = true;
    this.merchantsFormArray.value.forEach((item: IMerchants) => {
      if (item.isActive !== merchant.value.isActive || !merchant.value.isActive) {
        this.isMerchantSame = false;
        return;
      }
    })
  }

  changeSameTime(): void {
    if (!this.isTimeSame) return;
    this.sameTimeDialog('').subscribe(res => {
        this.isTimeSame = res;
        if (res) {
          this.settings?.merchants.forEach((item, index) => {
            this.merchantsFormArray.at(index).get('runAt').setValue(res);
          });
        }
      }
    );
  }

  changeTime(merchant: AbstractControl): void {
    this.isTimeSame = true;
    this.merchantsFormArray.value.forEach((item: IMerchants) => {
      if (!item.runAt || item.runAt !== merchant.value.runAt) {
        this.isTimeSame = false;
        return;
      }
    })
  }

  changeSameTerms(): void {
    if (!this.isTermsSame) return;
    this.sameTimeDialog(this.periodTypes).subscribe(res => {
      this.isTermsSame = res;
      if (res) {
        this.settings?.merchants.forEach((item, index) => {
          this.merchantsFormArray.at(index).get('issueMoneyPeriodTypeId').setValue(res);
        });
      }
    })
  }

  changeTerm(evt: ISelect, merchant: AbstractControl): void {
    this.isTermsSame = true;
    this.merchantsFormArray.value.forEach((item: IMerchants) => {
      if (item.merchantId === merchant.value.merchantId && evt) {
        item.issueMoneyPeriodTypeId = evt.id
      }
      if (!item.issueMoneyPeriodTypeId || item.issueMoneyPeriodTypeId !== evt?.id) {
        this.isTermsSame = false;
        return;
      }
    })
  }

  private sameTimeDialog(value: any): Observable<any> {
    return this.dialog.open(WithdrawalAmountSettingsDialogComponent, {
      data: value,
      width: '400px',
      panelClass: "custom-modalbox",
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
  }

  private getPeriodTypes(): void {
    this.service.getPeriodTypes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.periodTypes = res.data)
  }

  private getSettingDetail(): void {
    this.service.getWithdrawalAmountSettings()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.settings = res.data;
          this.form.patchValue(res.data);
          res.data.merchants.forEach(item => {
            item.issueMoneyPeriodTypeId = item.issueMoneyPeriodTypeId || '';
            item.isActive = item.isActive || false;
            item.runAt = this.datePipe.transform(item.runAt, 'HH:mm') || '';
            item.merchantId = item.merchantId || '';
            item.merchantName = item.merchantName || '';
            const formGroup = this.newMerchant();
            formGroup.setValue(item);
            this.merchantsFormArray.push(formGroup);
            this.isTimeSame = true;
            this.isMerchantSame = true;
            if (item.isActive !== res.data.merchants[0].isActive) {
              this.isMerchantSame = false;
              return;
            }
            this.isMerchantSame = item.isActive;
            if (!item.runAt || item.runAt !== res.data.merchants[0].runAt) {
              this.isTimeSame = false;
              return;
            }
          });
        }

      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: this.settings?.id,
      merchants: this.fb.array([]),
      isActive: [false]
    });
  }

  private newMerchant(): FormGroup {
    return new FormGroup({
      merchantId: new FormControl('', [Validators.required]),
      merchantName: new FormControl(''),
      issueMoneyPeriodTypeId: new FormControl(''),
      runAt: new FormControl(''),
      isActive: new FormControl(false)
    }, [IssueMoneySettingsValidator.validate()])
  }

  private hasChanges(): boolean {
    if (!this.form) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && this.form.touched;
  }
}
