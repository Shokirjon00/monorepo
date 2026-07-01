import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { delay, finalize, Observable, of, Subject, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { ISelect } from '@core/interfaces/select.interface';
import { PosService } from '@modules/merchant-container/pos/services/pos.service';
import { IPosDetail } from '@modules/merchant-container/pos/interfaces/pos.interface';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { Location } from '@angular/common';
import { mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { PhoneValidator } from '@core/validators/phone-validator';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { isPhone, MAX_PHONE_NUMBER } from '@core/helper';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { SvgIconComponent } from 'angular-svg-icon';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { NgxMaskDirective } from 'ngx-mask';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ToastModule } from '@shared/components/toast/toast.module';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';

@Component({
  standalone: true,
  selector: 'em-pos-edit',
  templateUrl: './pos-edit.component.html',
  styleUrls: ['./pos-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorModule,
    NgxMaskDirective,
    EskhataBankLoaderComponent,
    ToastModule,
    SimpleSelectListComponent,
    EmHeaderComponent,
  ],
  providers: [PosService],
})
export class PosEditComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  integrationsTypeValue: ISelect[];
  posTypesValue: ISelect[];
  posDetail: IPosDetail;

  headerData: IHeader = {
    isFilter: false,
    tabShow: false,
  };
  submitted: boolean = false;

  readonly isMobile = isPhone();

  private posId: string;
  private merchantId: string;
  private canDeactivate$ = new Subject<boolean>();
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private location = inject(Location);
  private service = inject(PosService);
  private headerService = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private merchantServices = inject(MerchantService);

  updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor() {
    super();
    this.initData();
  }

  get posContactJson(): FormGroup {
    return this.form.get('posContactJson') as FormGroup;
  }

  get smsPhoneNumbers(): FormArray {
    return this.posContactJson.get('smsPhoneNumbers') as FormArray;
  }

  get emails(): FormArray {
    return this.posContactJson.get('emails') as FormArray;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get posContactJsonControls(): { [key: string]: AbstractControl } {
    return this.posContactJson.controls;
  }

  ngOnInit(): void {
    this.getPosTypes();
    this.getIntegrationTypes();
    this.creatForm();
    if (this.updateUrl !== 'new') this.getDetail();
  }

  initData(): void {
    this.headerService.setHeader(this.headerData);
    this.headerService
      .getPosId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(posId => (this.posId = posId));
    this.headerService
      .getMerchantId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchantId => (this.merchantId = merchantId));
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.posContactJson.markAllAsTouched();
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!' });
      return null;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    if (this.emails.value[0] === '') this.emails.value[0] = null;
    this.form.get('merchantId').setValue(this.merchantId);
    if (this.updateUrl !== 'new') {
      $observer = this.service.updatePos({ ...this.posDetail, ...this.form.value });
    } else {
      $observer = this.service.createPos(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => (this.submitted = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
          setValidationErrors(this.posContactJson, res);
        }
      });
  }

  back(): void {
    this.location.back();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
          successButtonText: 'Да',
          cancelButtonText: 'Нет',
        },
        maxWidth: '90vw',
      })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  addPhoneNumber(): void {
    const countPhone = this.smsPhoneNumbers.value.length;
    if (countPhone <= MAX_PHONE_NUMBER) {
      this.smsPhoneNumbers.push(new FormControl('+992', [Validators.required, PhoneValidator.validate()]));
    }
  }

  removePhoneNumber(index: number): void {
    this.smsPhoneNumbers.removeAt(index);
  }

  private creatForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, WhiteSpaceValidator.validate(), Validators.maxLength(100)]],
      merchantId: [this.merchantId, Validators.required],
      posTypeId: ['', Validators.required],
      isActive: [false],
      integrationTypeId: ['', Validators.required],
      posContactJson: this.fb.group({
        cashierName: [null, Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+([ -][a-zA-Zа-яёА-ЯЁ]+)*$')],
        emails: this.fb.array([new FormControl(null, [Validators.email])]),
        smsPhoneNumbers: this.fb.array(
          [new FormControl('+992', [Validators.required, PhoneValidator.validate()])],
          [PhoneValidator.uniquePhoneValidate()]
        ),
      }),
    });
  }

  private hasChanges(): boolean {
    if (!this.form) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && this.form.touched;
  }

  private getPosTypes(): void {
    this.service
      .getPosTypeDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posTypesValue = res.data;
        }
      });
  }

  private getIntegrationTypes(): void {
    this.merchantServices
      .getIntegrationsDictionary(this.merchantId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.integrationsTypeValue = res.data;
        }
      });
  }

  private getDetail(): void {
    this.service
      .getPosUpdateDetail(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posDetail = res.data;
          this.merchantId = res.data.merchantId;
          this.form.patchValue(res.data);
          this.smsPhoneNumbers.clear();
          res.data.posContactJson.smsPhoneNumbers.forEach(item => {
            this.smsPhoneNumbers.push(new FormControl(item, [Validators.required, PhoneValidator.validate()]));
          });
        }
      });
  }
}
