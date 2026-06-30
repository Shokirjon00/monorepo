import {Component, DestroyRef, inject, Input, OnInit, signal} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { MultiSelectListModule } from "@shared/components/multi-select-list/multi-select-list.module";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { Location } from "@angular/common";
import { NgxMaskDirective } from "ngx-mask";
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DynamicUploadFieldComponent } from "@shared/components/dynamic-upload-field/dynamic-upload-field.component";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "@core/services/message.service";
import { ToastEnum } from "@core/enums/toast-enum";
import { finalize, Observable, of } from "rxjs";
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { ICompanyRegistration } from "@modules/company-registration/list-registration/interfaces/company-registration.interfaces";
import { CompanyRegistrationApplicationsService } from "@modules/company-registration/list-registration/services/company-registration.service";
import { ISelect } from "@core/interfaces/select.interface";
import { CompanyService } from "@modules/client/company/services/company.service";
import { MerchantService } from "@modules/client/merchant/services/merchant.service";
import { IHeader } from "@core/interfaces/header.interface";
import { latinAndSpecialCharsValidator } from '@core/validators/latin-validator';
import { SharedModule } from "@shared/shared.module";
import { environment as env } from "@environments/environment";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MultiSelectComponent} from "@shared/components/multi-select/multi-select.component";
import {PosTypeService} from "@modules/client/merchant-service/services/posType.service";
import {UserService} from "@core/services/user.service";
import {CashbackRatesService} from "@modules/directory/cashback-rates/services/cashback-rates.service";
import {IMerchantService} from "@modules/client/merchant-service/interfaces/merchant-service.interface";
import {
  IListRegistrationEdit
} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-edit/list-registration-edit";
import {DateTimePipe} from "@core/pipe/date-time.pipe";
import {
  ICompanyRegistrationDetail
} from "@modules/company-registration/list-registration/interfaces/company-registration-detail.interfaces";
import {PhoneValidator} from "@core/validators/phone-validator";

const EMAIL_REQUIRED_CLIENT_ID = 'a46d2af1-30eb-4467-8fe1-5ed6ba2bd26a';
const EMAIL_OPTIONAL_CLIENT_ID = '4636b157-ca2f-4f00-8164-1e3ababa2d5b';

@Component({
  standalone: true,
  selector: 'em-list-registration-edit',
  templateUrl: './list-registration-edit.component.html',
  imports: [
    MultiSelectListModule,
    ReactiveFormsModule,
    AutocompleteComponent,
    SharedModule,
    NgxMaskDirective,
    NgxPermissionsModule,
    SvgIconComponent,
    DynamicUploadFieldComponent,
    EmHeaderComponent,
    MultiSelectComponent,
    DateTimePipe
  ],
  styleUrls: ['./list-registration-edit.component.scss'],
  providers: [
    CompanyService,
    MerchantService,
    UserService,
    PosTypeService,
    CashbackRatesService
  ]
})
export class ListRegistrationEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg',
    memType: 'application/pdf, image/jpg',
    uploadPath: 'company_registration_applications/upload_file',
  };
  branchesCount = signal(1);
  branchApi = `${env.api.branches}/${env.api.dictionary}`;
  resBankEmpApi = `${env.api.adminUser}/${env.api.dictionary}`;
  clientType = `${env.api.companyLegalForms}/${env.api.dictionary}`;
  adminRoleValues: ISelect[];
  posTypes: IMerchantService[];
  form: FormGroup;
  statuses: ISelect[];
  companyRegistration: ICompanyRegistrationDetail;
  statusApplication: ISelect[];
  fileStorageUrl: string;
  fileStorageToken: string;
  headerData: IHeader = {

    isFilter: false,
    tabShow: false
  };
  submitted = signal(false);
  loading = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(CompanyRegistrationApplicationsService);
  private readonly statusService = inject(CompanyRegistrationApplicationsService);
  private readonly adminUsers = inject(UserService);
  private readonly posTypesService = inject(PosTypeService);
  private readonly listRegistrationId = this.activatedRoute.snapshot.params['id'];
  private readonly updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  get branches(): FormArray {
    return this.form.get('branches') as FormArray;
  }

  ngOnInit(): void {
    this.creatForm();
    this.loadDictionaries();

    if (this.updateUrl) {
      this.loadUpdateData();
    }
  }

  addBranch(): void {
    this.branches.push(this.createBranchGroup());
    this.branchesCount.update(v => v + 1);
  }

  removeBranch(index: number): void {
    this.branches.removeAt(index);
  }

  generatingApplication(): void {
    this.loading.set(true);
    this.service.getComponyRegistrationApplication(this.listRegistrationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          const data: any = res.data || {};
          if (data.offerFileId) {
            this.form.get('offerFileId')?.setValue(data.offerFileId);
          }
          if (data.statementFileId) {
            this.form.get('statementFileId')?.setValue(data.statementFileId);
          }
          if (data.email) {
            this.form.get('email')?.setValue(data.email);
          }
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      }, err => {
        this.messageService.add({ severity: ToastEnum.ERROR, summary: err?.message || 'Ошибка запроса' });
      });
  }

  onSubmit(): void {
    this._pruneEmptyBranches();
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Неправильно заполнены данные!'
      });
      return;
    }

    this.submitted.set(true);

    const payload = this.buildPayload();

    this.service.updateCompanyRegistration(payload)
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });

          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitted.set(false))
      )
      .subscribe(res => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  createBranchGroup(): FormGroup {
    return this.fb.group({
      address: [''],
      name: [''],
      quantity: ['']
    });
  }

  private buildPayload(): any {
    const formData = { ...this.form.value };

    this.mapBranchesToMerchants(formData);
    this.normalizePosTypes(formData);
    this.normalizeFileList(formData);
    this.removeComments(formData);

    const payload = {
      ...this.companyRegistration,
      ...formData
    };

    this.ensureMerchants(payload);
    this.normalizeMerchants(payload);

    return payload;
  }

  private mapBranchesToMerchants(data: any): void {
    if (!Array.isArray(data.branches)) return;

    data.merchants = data.branches.map((b: any) => ({
      name: b.name,
      address: b.address,
      quantity: b.quantity != null ? Number(b.quantity) : null
    }));

    delete data.branches;
  }

  private normalizeFileList(data: any): void {
    if (Array.isArray(data.fileIds)) {
      data.fileIds = data.fileIds
        .map((f: any) => (f ? String(f) : null))
        .filter(Boolean);

      return;
    }

    if (Array.isArray(this.companyRegistration?.fileIds)) {
      data.fileIds = this.companyRegistration.fileIds;
    } else {
      data.fileIds = [];
    }
  }

  private removeComments(data: any): void {
    if (data.comments !== undefined) {
      delete data.comments;
    }
  }

  private ensureMerchants(payload: any): void {
    if (!payload.merchants) {
      payload.merchants =
        payload.merchants ??
        this.companyRegistration?.merchants ??
        [];
    }
  }

  private normalizeMerchants(payload: any): void {
    if (
      Array.isArray(payload.merchants) &&
      typeof this.companyRegistration?.merchants === 'string'
    ) {
      try {
        payload.merchants = JSON.stringify(payload.merchants);
      } catch {
        payload.merchants = JSON.stringify([]);
      }
    }
  }

  private watchCompanyLegalForm(): void {
    const emailControl = this.form.get('email');
    const typeControl = this.form.get('companyLegalFormId');
    typeControl?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(value => {
      if (value === EMAIL_REQUIRED_CLIENT_ID) {
        emailControl?.setValidators([Validators.required, Validators.email]);
      } else if (value === EMAIL_OPTIONAL_CLIENT_ID) {
        emailControl?.setValidators([Validators.email]);
      } else {
        emailControl?.setValidators([Validators.email]);
      }
      emailControl?.updateValueAndValidity();
    });
  }

  private loadDictionaries(): void {
    this.getStatuses();
    this.getUsersDictionary();
    this.getPosDictionary();
    this.getStatusService();
  }

  private loadUpdateData(): void {
    this.submitted.set(true);

    this.service.getUpdateCompanyRegistration(this.listRegistrationId)
      .pipe(
        finalize(() => this.submitted.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          const data = res.data;

          this.setMeta(res);
          this.companyRegistration = data;
          this.dataSource = data;

          this.setMerchants(data);
          this.patchForm(data);
          this.setFileIds(data);
          this.setCompanyLegalForm(data);

          this.form.updateValueAndValidity();
        }
      });
  }

  private setMeta(res: any): void {
    this.fileStorageUrl = res.meta.fileStorageUrl;
    this.fileStorageToken = res.meta.fileStorageToken;
  }

  private setMerchants(data: any): void {
    if (!data.merchants || !Array.isArray(data.merchants) || !data.merchants.length) {
      return;
    }

    this.clearBranches();

    data.merchants.forEach((m: IListRegistrationEdit) => {
      this.branches.push(
        this.fb.group({
          address: [m.address || ''],
          name: [m.name || ''],
          quantity: [m.quantity ?? '']
        })
      );
    });

    this.branchesCount.update(() => data.merchants.length);
  }

  private clearBranches(): void {
    this.branches.clear();
  }

  private normalizePosTypes(posTypes: any): string[] {
    if (!posTypes) return [];

    if (Array.isArray(posTypes)) {
      return posTypes;
    }

    if (typeof posTypes === 'string') {
      if (posTypes.includes('|')) return posTypes.split('|');
      if (posTypes.includes(',')) return posTypes.split(',');
      return [posTypes];
    }

    return [posTypes];
  }

  private patchForm(data: any): void {
    const patch = { ...data } as any;

    patch.posTypes = this.normalizePosTypes(patch.posTypes);

    this.form.patchValue(patch);
  }

  private setFileIds(data: any): void {
    if (!data.fileIds || !Array.isArray(data.fileIds)) {
      return;
    }

    const uniqueFileIds = Array.from(new Set(data.fileIds.filter(Boolean)));
    this.form.get('fileIds')?.setValue(uniqueFileIds);
  }

  private setCompanyLegalForm(data: any): void {
    if (data.companyLegalFormId) {
      this.form.get('companyLegalFormId')?.setValue(data.companyLegalFormId);
    }
  }

  private getUsersDictionary(): void {
    this.adminUsers.getUsersDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.adminRoleValues = res.data;
      })
  }

  private getPosDictionary(): void {
    this.posTypesService.getPosTypeDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.posTypes = res.data;
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.listRegistrationId, Validators.required],
      companyName: ['', Validators.required],
      activitySphere: ['', Validators.required],
      email: ['', Validators.email],
      address: ['', Validators.required],
      inn: ['', Validators.required],
      ein: ['', Validators.required],
      applicantFullName: ['', Validators.required],
      companyNameLatin: ['', [Validators.required, latinAndSpecialCharsValidator()]],
      applicantPhoneNumber: ['', [Validators.required, PhoneValidator.validate()]],
      companyRegistrationApplicationStatusId: ['', Validators.required],
      branches: this.fb.array([this.createBranchGroup()]),
      statementFileId: [''],
      offerFileId: [''],
      taxStatementFileId: [''],
      fileIds: [[]],
      branchId: ['', Validators.required],
      managerId: [''],
      companyLegalFormId: [''],
      comment: [''],
      posTypeIds: [[]],
    });
    this.watchCompanyLegalForm();
  }

  private getStatuses(): void {
    this.service.getCompanyRegistrationStatusesDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.statuses = res.data)
  }

  private getStatusService(): void {
    this.statusService.getCompanyRegistrationStatusesDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.statusApplication = res.data)
  }

  private _pruneEmptyBranches(): void {
    const branches = this.form?.get('branches') as FormArray;
    if (!branches?.length) return;

    for (let i = branches.length - 1; i >= 0; i--) {
      const group = branches.at(i) as FormGroup;
      const { address, name, quantity } = group.value;
      const isEmpty = [address, name, quantity]
        .every(v => !String(v ?? '').trim());
      if (isEmpty) {
        branches.removeAt(i);
      }
    }
    this.branchesCount.update(() => branches.length);
  }
}
