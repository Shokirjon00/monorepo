import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ICompanyDetail } from '@modules/client/company/interfaces/company-detail.interface';
import { environment as env, environment } from '@environments/environment';
import { Location } from '@angular/common';
import { CompanyService } from '@modules/client/company/services/company.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { BreadcrumbService } from 'xng-breadcrumb';
import { MatDialog } from '@angular/material/dialog';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { delay } from 'rxjs/operators';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { ValidatorComponent } from '@shared/components/validator/validator.component';
import { NgxMaskDirective } from 'ngx-mask';
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';
import { UploadFieldComponent } from '@shared/components/upload-field/upload-field.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { digitsOnlyValidator } from "@core/utils/custom-validators";
import { JobLogService } from "@modules/job-log/services/job-log.service";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-company-edit',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    AngularSvgIconModule,
    NgxPermissionsModule,
    ValidatorComponent,
    NgxMaskDirective,
    AutocompleteComponent,
    UploadFieldComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent
  ],
  providers: [
    CompanyService,
    JobLogService
  ]
})
export class CompanyEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'companies/upload'
  };
  form: FormGroup;
  companyDetail: ICompanyDetail;
  companies: ICompanyDetail[];
  submitted: boolean;
  api = environment.api;
  fileStorageUrl: string;
  fileStorageToken: string;
  loading: boolean;
  checkLoading: boolean;
  formEdit: boolean = false;
  jobLogId: string;
  countryFilter = {};
  regionFilter = {};
  areaFilter = {};
  branchApi = `${env.api.branches}/${env.api.dictionary}`;
  countryApi = `${env.api.countries}/${env.api.dictionary}`;
  regionApi = `${env.api.regions}/${env.api.dictionary}`;
  areaApi = `${env.api.areas}/${env.api.dictionary}`;
  cityApi = `${env.api.cities}/${env.api.dictionary}`;
  resBankEmpApi = `${env.api.responsibleBankEmployee}/${env.api.dictionary}`;
  companyLegalFormDictionaryApi = `${env.api.companyLegalForms}/${env.api.dictionary}`;
  companySegmentApi = `${env.api.companySegments}/${env.api.dictionary}`;
  companyLegalFormDisabled: boolean = true;
  branchDisabled: boolean = true;
  countryDisabled: boolean = true;
  regionDisabled: boolean;
  areaDisabled: boolean;
  cityDisabled: boolean;
  resBankEmployeeDisabled: boolean = true;
  companySegmentDisabled: boolean = true;
  permission$: Promise<boolean>;

  private permissionService = inject(NgxPermissionsService);
  private service = inject(CompanyService);
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private jobLogService = inject(JobLogService);
  private breadcrumbService = inject(BreadcrumbService);

  companyId = this.activatedRoute.snapshot.params['companyId'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.permission$ = this.permissionService.hasPermission('CompanyUploadContract');
    this.createForm();
    if (this.updateUrl !== 'new') {
      this.formEdit = true
      this.submitted = true;
      this.service.getUpdateDetail(this.companyId)
        .pipe(
          finalize(() => this.submitted = false),
          takeUntil(this.destroyed$))
        .subscribe(res => {
          this.companyDetail = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.dataSource = res.data
          this.form.patchValue(res.data, {emitEvent: false});
          this.breadcrumbService.set('@companyDetail', this.companyDetail.name);
          this.form.updateValueAndValidity();
        });
    } else {
      this.disableForm()
    }
  }


  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    this.form = this.setDefaultValue(this.form)
    if (this.updateUrl !== 'new') {
      this.form.get('id').setValue(this.companyDetail.id)
      $observer = this.service.updateCompany({...this.companyDetail, ...this.form.value});
    } else {
      $observer = this.service.createCompany(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        takeUntil(this.destroyed$),
        finalize(() => this.submitted = false)
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

  getSearchClient(): void {
    if (this.form.value.inn) {
      const searchForm: FormGroup = this.fb.group({
        name: this.form.value.name,
        extCodeAbs: this.form.value.extCodeAbs,
        inn: this.form.value.inn
      });
      this.checkLoading = true;
      this.service.searchClient(searchForm.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.jobLogId = res.data.jobLogId;
          this.checkJobLog(res.data.jobLogId)
        })
    }
  }

  changed(company: ICompanyDetail): void {
    this.form.patchValue(company);
    this.formEdit = true;
    this.disableForm()
  }

  changedCountry(companyId: string): void {
    if (companyId === '') {
      this.form.get('regionId').setValue('');
      this.form.get('areaId').setValue('');
      this.form.get('cityId').setValue('');
      this.regionDisabled = false;
    } else if (this.formEdit) {
      this.regionDisabled = true;
    }
    this.countryFilter = {countryId: companyId};
  }

  changedRegion(regionId: string): void {
    if (regionId === '') {
      this.form.get('areaId').setValue('');
      this.form.get('cityId').setValue('');
      this.areaDisabled = false;
    } else {
      this.areaDisabled = true;
    }
    this.regionFilter = {regionId: regionId};
  }

  changedArea(areaId: string): void {
    if (areaId === '') {
      this.form.get('cityId').setValue('');
      this.cityDisabled = false;
    } else {
      this.cityDisabled = true;
    }
    this.areaFilter = {areaId: areaId};
  }

  deactivateFileIds(event: any): void {
    this.form.controls['deletedContractFiles'].patchValue(event);
  }

  private checkJobLog(jobLogId: string): void {
    this.jobLogService.check(jobLogId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (!res.status) {
          this.checkLoading = false;
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        } else {
          if (res.data.status === 0 && res.data.allowedTryCount >= 0) {
            return this.setTimeout(() => this.checkJobLog(jobLogId), 2000);
          } else if (res.data.status === 1) {
            this.companies = res.data.response.companies;
            if (res.data.response.companies.length == 1) {
              // this.form.reset()
              this.companies.forEach(item => this.form.patchValue(item));
              this.form.patchValue(res.data.response.companies);
              this.formEdit = true;
              this.disableForm()
            } else if (!res.data.response.companies.length) {
              this.messageService.add({severity: ToastEnum.ERROR, summary: res.data.response.stateMessage});
            }
          }
          this.checkLoading = false
        }
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: '',
      inn: ['', [Validators.minLength(9), Validators.maxLength(9), Validators.required]],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(255)]],
      extCodeAbs: [null, Validators.maxLength(50)],
      extCodeEqms: [null, [Validators.maxLength(50), digitsOnlyValidator()]],
      companyLegalFormId: ['', Validators.required],
      countryId: ['1b3f6684-0a20-4cca-9f4e-fd5744816e02', Validators.required],
      regionId: ['', Validators.required],
      areaId: ['', Validators.required],
      cityId: ['', Validators.required],
      branchId: ['', Validators.required],
      address: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(255)]],
      referName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      companySegmentId: ['', Validators.required],
      contractFiles: '',
      deletedContractFiles: '',
      email: ['', Validators.email],
      isActive: [false],
      isReadyForEqmsSync: [true],
      responsibleBankEmployeeId: ['']
    });
  }

  private disableForm(): void {
    if (!this.formEdit) {
      this.form.controls['name'].disable();
      this.form.controls['extCodeAbs'].disable();
      this.form.controls['extCodeEqms'].disable();
      this.companyLegalFormDisabled = false;
      this.branchDisabled = false;
      this.countryDisabled = false;
      this.regionDisabled = false;
      this.resBankEmployeeDisabled = false;
      this.companySegmentDisabled = false;
      this.form.controls['regionId'].disable();
      this.form.controls['address'].disable();
      this.form.controls['referName'].disable();
    } else {
      this.form.controls['name'].enable();
      this.form.controls['extCodeAbs'].enable();
      this.form.controls['extCodeEqms'].enable();
      this.companyLegalFormDisabled = true;
      this.branchDisabled = true;
      this.countryDisabled = true;
      this.resBankEmployeeDisabled = true;
      this.companySegmentDisabled = true;
      this.form.controls['address'].enable();
      this.form.controls['referName'].enable();
    }
  }
}
