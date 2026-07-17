import { Component, inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ISelect } from '@core/interfaces/select.interface';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum, IPaginate } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { setNestedGroupValidationErrors, setValidationErrors } from '@core/validators/set-validation-errors';
import { MailingService } from '@modules/mailing/services/mailing.service';
import { environment as env } from '@environments/environment';
import { IMailingUpdate } from '@modules/mailing/interfaces/mailing.interface';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { PosService } from '@modules/client/pos/services/pos.service';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import moment from "moment/moment";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { MultiSelectListModule } from "@shared/components/multi-select-list/multi-select-list.module";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { MultiSelectComponent } from "@shared/components/multi-select/multi-select.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-mailing-edit',
  templateUrl: './mailing-edit.component.html',
  styleUrls: ['./mailing-edit.component.scss'],
  providers: [
    MailingService,
    PosService,
    MerchantService
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    SimpleSelectListComponent,
    MultiSelectListModule,
    AutocompleteComponent,
    MultiSelectComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    NgxPermissionsAllowStubDirective
  ]
})
export class MailingEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  actionType: ISelect[];
  periodTypes: ISelect[];
  merchantsDictionary: ISelect[];
  posesDictionary: ISelect[];
  mailingDetail: IMailingUpdate;
  loading: boolean = false;
  merchantPaginate: IPaginate;
  posPaginate: IPaginate;
  merchantFilter = ''
  posFilter = '';
  merchantDisabled: boolean = false;
  posesDisabled: boolean = false;
  submitted: boolean = false;
  paymentStatusesDictionaryApi = `${env.api.paymentStatuses}/${env.api.dictionary}`;
  companyDictionaryApi = `${env.api.companies}/${env.api.dictionary}`;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MailingService);
  private readonly merchantService = inject(MerchantService);
  private readonly posService = inject(PosService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private mailingId = this.activatedRoute.snapshot.parent.params['mailingId'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  get mailingRecipientGroup(): FormGroup {
    return this.form.get('mailingRecipient') as FormGroup;
  }

  get mailingRecipientControls(): { [key: string]: AbstractControl } {
    return this.mailingRecipientGroup.controls;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getActionType();
    this.getPeriodType();
    if (this.updateUrl !== 'new') {
      this.getDetail()
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.updateMailing({...this.mailingDetail, ...this.form.value});
    } else {
      $observer = this.service.createMailing(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.status) {
            this.form.reset();
            this.back();
          } else {
            setValidationErrors(this.form, res);
            setNestedGroupValidationErrors(this.mailingRecipientGroup, res);
          }
        }
      );
  }

  selectedCompany(companyId: string): void {
    if (companyId === '') {
      this.mailingRecipientGroup.get('merchantsId').setValue([]);
      this.mailingRecipientGroup.get('posesId').setValue([]);
      this.mailingRecipientGroup.get('isSendCompany').setValue(false);
      this.mailingRecipientGroup.get('isSendMerchant').setValue(false);
      this.mailingRecipientGroup.get('isSendPos').setValue(false);
      this.merchantDisabled = false;
      this.posesDisabled = false;
    } else {
      this.merchantDisabled = true;
      this.getMerchantDictionary({filters: 'companyId==' + companyId})
    }
    this.merchantFilter = 'companyId==' + companyId;
  }

  changeMerchant(merchantIds: string[]): void {
    if (!merchantIds.length) {
      this.mailingRecipientGroup.get('posesId').setValue([]);
      this.mailingRecipientGroup.get('isSendMerchant').setValue(false);
      this.mailingRecipientGroup.get('isSendPos').setValue(false);
      this.posesDisabled = false;
    } else {
      this.posesDisabled = true;
      this.getPosDictionary({filters: 'merchantId==' + merchantIds.join('|')})
    }
    this.posFilter = 'merchantId==' + merchantIds.join('|');
  }

  changePos(posIds: string[]): void {
    if (!posIds.length) this.mailingRecipientGroup.get('isSendPos').setValue(false);
  }

  nextPageMerchant(pagination: IPaginate): void {
    this.getMerchantDictionary({
      filters: this.merchantFilter,
      page: pagination.pageNumber
    })
  }

  nextPagePos(pagination: IPaginate): void {
    this.getPosDictionary({
      filters: this.posFilter,
      page: pagination.pageNumber
    })
  }

  private getActionType(): void {
    this.service.getActionTypes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.actionType = res.data)
  }

  private getPeriodType(): void {
    this.service.getPeriodTypes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.periodTypes = res.data)
  }

  private getMerchantDictionary(params: IFilterParams): void {
    this.merchantService.getMerchantsDictionary(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          if (res.meta.pagination.pageNumber > 1) {
            this.merchantsDictionary = this.merchantsDictionary.concat(res.data);
          } else {
            this.merchantsDictionary = res.data;
          }
          this.merchantPaginate = res.meta.pagination
        }
      })
  }

  private getPosDictionary(params: IFilterParams): void {
    this.posService.getPosDictionary(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          if (res.meta.pagination.pageNumber > 1) {
            this.posesDictionary = this.posesDictionary.concat(res.data);
          } else {
            this.posesDictionary = res.data;
          }
          this.posPaginate = res.meta.pagination
        }
      })
  }

  private getDetail(): void {
    this.service.getMailingDetail(this.mailingId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.mailingDetail = res.data;
        this.dataSource = res.data;
        res.data.runAt = moment(res.data.runAt, 'HH:mm:ss').format('HH:mm:ss');
        this.form.patchValue(res.data);
        this.form.updateValueAndValidity();
        this.merchantFilter = 'companyId==' + this.mailingDetail.mailingRecipient.companyId;
        this.posFilter = 'merchantId==' + this.mailingDetail.mailingRecipient?.merchantsId.join('|');
        if (this.posFilter) {
          this.getPosDictionary({filters: this.posFilter});
          this.posesDisabled = true;
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      actionTypeId: [null, Validators.required],
      periodTypeId: [null, [Validators.required]],
      runAt: [null, [Validators.required]],
      paymentStatusesId: [[], Validators.required],
      isActive: [false, Validators.required],
      isArchived: [false],
      mailingRecipient: this.fb.group({
        companyId: [null, Validators.required],
        isSendCompany: [false, Validators.required],
        merchantsId: [null],
        isSendMerchant: [false, Validators.required],
        posesId: [null],
        isSendPos: [false, Validators.required],
      }),
    });
  }

}
