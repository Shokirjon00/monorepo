import { Component, inject, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from "angular-svg-icon";
import { AutocompleteComponent, EmHeaderComponent, MultiSelectComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IFilterParams, IHeader, IPaginate, IParam, ISelect } from "@core/interfaces";
import { environment as env } from "@environments/environment";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { HeaderService, MessageService } from "@core/services";
import { MerchantService } from "@modules/client/merchant/services/merchant.service";
import { PosService } from "@modules/client/pos/services/pos.service";
import { delay, finalize, mergeMap } from "rxjs/operators";
import { Observable, of, takeUntil } from "rxjs";
import { ToastEnum } from '@eskhata/util';
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { PosTerminalService } from "@modules/main-terminal/pos-terminal/services/pos-terminal.service";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";

@Component({
  selector: 'em-pos-terminal-edit',
  standalone: true,
  templateUrl: './pos-terminal-edit.component.html',
  styleUrl: './pos-terminal-edit.component.scss',
  providers: [PosTerminalService, PosService],
  imports: [
    SvgIconComponent,
    MultiSelectComponent,
    ValidatorComponent,
    AutocompleteComponent,
    FormsModule,
    ReactiveFormsModule,
    ToastComponent,
    EmHeaderComponent
  ],
})
export class PosTerminalEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  acTypeDetail: IPosTerminal;
  gateways: ISelect[];
  merchantsDictionary: ISelect[];
  posesDictionary: ISelect[];
  oldCompanyId: string;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  merchantFilter = '';
  posFilter = '';
  submitted: boolean = false;
  posId: any;
  posName: any;
  posesDisabled: boolean = false;
  merchantDisabled: boolean;
  companyDictionaryApi = `${env.api.companies}/${env.api.dictionary}`;
  paginate: IPaginate | any;
  params: Params = {};

  private fb = inject(FormBuilder);
  private service = inject(PosTerminalService);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private merchantService = inject(MerchantService);
  private posService = inject(PosService);
  private headerService = inject(HeaderService);

  private posTerminalId = this.activatedRoute.snapshot.parent.params['posTerminalId'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
    this.initData()
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.service.getUpdateDetail(this.posTerminalId)
      .pipe(
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        this.acTypeDetail = res.data;
        this.dataSource = res.data;

        const merchantIds = Array.isArray(res.data.merchantId) ? res.data.merchantId : [res.data.merchantId];
        const posIds = Array.isArray(res.data.posId) ? res.data.posId : [res.data.posId];

        this.form.patchValue({
          ...res.data,
          merchants: merchantIds,
          poses: posIds,
        });

        this.form.updateValueAndValidity();
        this.oldCompanyId = this.acTypeDetail.companyId
        this.merchantFilter = 'companyId==' + this.acTypeDetail.companyId;
        this.posFilter = 'merchantId==' + this.acTypeDetail.merchantId;

        if (this.posFilter) {
          this.getPosDictionary({filters: this.posFilter});
          this.posesDisabled = true;
        }
      });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return;
    }

    this.submitted = true;
    let $observer: Observable<any>;

    const posesValue = Array.isArray(this.form.get('poses').value)
      ? this.form.get('poses').value.join(',')
      : this.form.get('poses').value;

    const body = {
      id: this.posTerminalId,
      posId: posesValue,
      number: this.form.get('number').value,
      phoneNumber: this.form.get('phoneNumber').value
    };

    if (this.updateUrl !== 'new') {
      $observer = this.service.getUpdate({...body})
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => {
          this.submitted = false;
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [''],
      phoneNumber: ['', Validators.required],
      number: ['', Validators.required],
      address: [{value: '', disabled: true}],
      name: [{value: '', disabled: true}],
      model: [{value: '', disabled: true}],
      appVersion: [{value: '', disabled: true}],
      os: [{value: '', disabled: true}],
      companyId: ['', Validators.required],
      merchants: ['', Validators.required],
      poses: ['', Validators.required],
    });
  }

  selectedCompany(companyId: string): void {
    if (this.oldCompanyId !== companyId) {
      this.form.get('merchants').setValue('');
      this.form.get('poses').setValue('');
    }
    if (companyId === '') {
      this.merchantDisabled = false;
      this.posesDisabled = false;
    } else {
      this.merchantDisabled = true;
      this.getMerchantDictionary({filters: 'companyId==' + companyId})
    }
    this.merchantFilter = 'companyId==' + companyId;
    this.oldCompanyId = companyId;
  }

  changeMerchant(merchantIds: string[]): void {
    const currentPoses = this.form.get('poses').value || [];
    const updatedPoses = currentPoses.filter((poseId: string) => {
      const pos = this.posesDictionary.find(pos => pos.id === poseId);
      return pos && merchantIds.includes(pos.id);
    });
    this.form.get('poses').setValue(updatedPoses);

    if (merchantIds.length === 0) {
      this.posesDisabled = false;
    } else {
      this.posesDisabled = true;
      this.getPosDictionary({filters: 'merchantId==' + merchantIds.join('|')});
    }

    this.posFilter = 'merchantId==' + merchantIds.join('|');
  }

  private getMerchantDictionary(params: IFilterParams): void {
    params.addDeactives = true;
    this.merchantService.getMerchantsWithoutPagination(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.merchantsDictionary = res.data;
        }
      });
  }

  private getPosDictionary(params: IFilterParams): void {
    const queryParams = {addDeactives: true};
    const bodyParams = {...params};
    this.posService.getPosDictionaryWithoutPagination(queryParams, bodyParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posesDictionary = res.data;
        }
      });
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
