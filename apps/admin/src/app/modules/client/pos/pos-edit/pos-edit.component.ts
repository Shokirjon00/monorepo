import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { ISelect } from '@eskhata/util';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { PosService } from '@modules/client/pos/services/pos.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { IPosDetail } from '@modules/client/pos/interfaces/pos-detail.interface';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@eskhata/util';
import { BreadcrumbService } from 'xng-breadcrumb';
import { MatDialog } from '@angular/material/dialog';
import { PhoneValidator } from '@core/validators/phone-validator';
import { EMAIL_PATTERN, MAX_PHONE_NUMBER, PHONE_PREFIX } from '@core/helper';
import { setNestedGroupValidationErrors, setValidationErrors } from '@core/validators/set-validation-errors';
import { delay, mergeMap } from 'rxjs/operators';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { digitsOnlyValidator } from '@eskhata/util';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent, SimpleSelectListComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { NgxMaskDirective } from "ngx-mask";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-pos-edit',
  templateUrl: './pos-edit.component.html',
  styleUrls: ['./pos-edit.component.scss'],
  providers: [MerchantService, PosService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    NgxMaskDirective,
    SimpleSelectListComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class PosEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  posTypesValue: ISelect[];
  integrationsTypeValue: ISelect[];
  posDetail: IPosDetail;
  merchantId: string;
  loading: boolean = false;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;
  private fb = inject(FormBuilder);
  private service = inject(PosService);
  private headerService = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private merchantService = inject(MerchantService);
  private breadcrumbService = inject(BreadcrumbService);
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  private posId: string;

  constructor(
    dialog: MatDialog,
    location: Location,
  ) {
    super(location, dialog);
    this.initData()
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

  get posContactJsonControls(): { [key: string]: AbstractControl } {
    return this.posContactJson.controls;
  }

  ngOnInit(): void {
    this.getPosTypes();
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.getDetail();
    } else {
      this.getIntegrationTypes();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.posContactJson.markAllAsTouched()
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    this.form.get('merchantId').setValue(this.merchantId);
    if (this.updateUrl !== 'new') {
      $observer = this.service.updatePos({...this.posDetail, ...this.form.value});
    } else {
      $observer = this.service.createPos(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
          setNestedGroupValidationErrors(this.posContactJson, res);
        }
      });
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
      qrText: [''],
      terminalId: [null],
      terminalSerialNumber: [null],
      extCodeEqms: [null, digitsOnlyValidator()],
      integrationTypeId: ['', Validators.required],
      posContactJson: this.fb.group({
        cashierName: [null, Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+([ -][a-zA-Zа-яёА-ЯЁ]+)*$')],
        eqmsPhoneNumber: ['', [PhoneValidator.validate]],
        emails: this.fb.array([new FormControl(null, [Validators.email, Validators.pattern(EMAIL_PATTERN)])]),
        smsPhoneNumbers: this.fb.array(
          [new FormControl(PHONE_PREFIX, [Validators.required, PhoneValidator.validate()])],
          [PhoneValidator.uniquePhoneValidate()])
      })
    })
  }

  private getPosTypes(): void {
    this.service.getPosTypeDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.posTypesValue = res.data;
      })
  }

  private getIntegrationTypes(): void {
    this.merchantService.getIntegrationsDictionary(this.merchantId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.integrationsTypeValue = res.data;
      })
  }

  private getDetail(): void {
    this.breadcrumbService.set('@posDetail', {skip: true});
    this.service.getPosUpdateDetail(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.posDetail = res.data;
        this.merchantId = res.data.merchantId;
        this.breadcrumbService.set('@posDetail', {label: this.posDetail.name, skip: false});
        this.form.patchValue(res.data);
        this.dataSource = res.data;
        this.smsPhoneNumbers.clear();
        res.data.posContactJson.smsPhoneNumbers.forEach(item => {
          this.smsPhoneNumbers.push(new FormControl(item, [Validators.required, PhoneValidator.validate()]));
        });
        this.getIntegrationTypes();
      });
  }

  private initData(): void {
    this.headerService.setHeader(this.headerData);
    this.headerService.getMerchantId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchantId => this.merchantId = merchantId);

    this.headerService.getPosId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(posId => this.posId = posId);
  }
}
