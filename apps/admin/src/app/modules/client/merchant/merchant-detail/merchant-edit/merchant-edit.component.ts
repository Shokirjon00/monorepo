import { Component, computed, DestroyRef, effect, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ISelect } from '@core/interfaces/select.interface';
import { finalize, mergeMap, Observable, of } from 'rxjs';
import { CategoryService } from '@modules/directory/category/services/category.service';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { AccountService } from '@core/services/account.service';
import { IMerchantDetail } from '@modules/client/merchant/interfaces/merchant-detail.interface';
import { WorkingDayService } from '@modules/directory/working-day/services/working-day.service';
import { CommonModule, Location } from '@angular/common';
import { CommissionService } from '@modules/directory/commission/services/commission.service';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { SubcategoryService } from '@modules/directory/subcategory/services/subcategory.service';
import { environment as env, environment } from '@environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PhoneValidator } from '@core/validators/phone-validator';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { setNestedGroupValidationErrors, setValidationErrors } from '@core/validators/set-validation-errors';
import { delay } from 'rxjs/operators';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { digitsOnlyValidator } from "@core/utils/custom-validators";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { NgxMaskDirective } from "ngx-mask";
import { UploadLogoComponent } from "@shared/components/upload-logo/upload-logo.component";
import { SharedModule } from "@shared/shared.module";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  WorkingDayEditComponent
} from "@modules/directory/working-day/working-day-detail/working-day-edit/working-day-edit.component";
import {
  RetailOutletStateService
} from "@modules/company-registration/retail-outlet/services/retail-outlet-state.service";
import {
  IIRetailOutletDetail
} from "@modules/company-registration/retail-outlet/interfaces/retail-outlet-detail.interfaces";
import { IPaginate } from "@core/interfaces";

@Component({
  standalone: true,
  selector: 'em-merchant-edit',
  templateUrl: './merchant-edit.component.html',
  styleUrls: ['./merchant-edit.component.scss'],
  providers: [
    MerchantService,
    AccountService
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    AutocompleteComponent,
    SimpleSelectListComponent,
    NgxMaskDirective,
    UploadLogoComponent,
    SharedModule,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class MerchantEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: '.jpg, .jpeg', uploadPath: 'merchants/upload_logo'
  };
  fileStorageUrl: string;
  fileStorageToken: string;
  customLogoKey: string = 'logo';
  api = environment.api;
  merchantId: string;
  companyId: string;
  selectedAccountTypeId = signal<string | null>(null);
  form: FormGroup = new FormGroup({});
  status: boolean;
  regions: ISelect[];
  isHidden: WritableSignal<boolean> = signal(false);
  categories: ISelect[];
  subCategories: ISelect[];
  workingDays: ISelect[];
  commissions: ISelect[];
  requisites: ISelect[];
  requisitesCard: ISelect[];
  merchantDetail: IMerchantDetail;
  showAmount: boolean = false;
  countryFilter = {};
  regionFilter = {};
  areaFilter = {};
  regionApi = `${env.api.regions}/${env.api.dictionary}`;
  areaApi = `${env.api.areas}/${env.api.dictionary}`;
  departmentApi = `${env.api.merchantGovernmentDepartments}/${env.api.dictionary}`
  incomeApi = `${env.api.merchantGovernmentIncomes}/${env.api.dictionary}`
  cityApi = `${env.api.cities}/${env.api.dictionary}`;
  paymentPurposesApi = `${env.api.paymentPurposes}/${env.api.dictionary}`;
  categoryApi = `${env.api.categories}/${env.api.dictionary}`;
  submitted: boolean = false;
  bankName: string = '';
  cardBankName: string = '';
  clearFields: string;
  inn?: any = '';
  receiver: string = '';
  updateUrl: string;
  areaDisabled: boolean;
  cityDisabled: boolean;
  pagination: IPaginate;

  protected isLoadingMore = signal<boolean>(false);
  protected currentPage = signal<number>(1);
  protected hasMorePages = computed(() => {
    return (this.pagination?.pageNumber ?? 0) <
      (this.pagination?.totalPages ?? 1);
  });

  private readonly queryParams: IFilterParams | any = {
    filters: '',
  };

  private readonly TREASURY_TYPE_ID = 'bea9682d-fe39-4e96-9b97-0279f95ca96a';
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MerchantService);
  private readonly categoryService = inject(CategoryService)
  private readonly subCategoryService = inject(SubcategoryService);
  private readonly workDayService = inject(WorkingDayService);
  private readonly commissionService = inject(CommissionService);
  private readonly accountService = inject(AccountService);
  private readonly messageService = inject(MessageService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private stateService = inject(RetailOutletStateService);

  constructor(
    location: Location,
    dialog: MatDialog
  ) {
    super(location, dialog);

    this.updateUrl = this.route.snapshot.routeConfig.path;
    this.merchantId = this.route.snapshot.parent.params['merchantId'];
    this.companyId = this.route.snapshot.parent.parent.params['companyId'];
  }

  isTreasury = computed(() =>
    this.selectedAccountTypeId() === this.TREASURY_TYPE_ID
  );

  get contactsControls(): { [key: string]: AbstractControl } {
    return this.merchantContactJson.controls;
  }

  get merchantContactJson(): FormGroup {
    return this.form.get('merchantContactJson') as FormGroup;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    const data: IIRetailOutletDetail = this.stateService.retailOutletInfo();
    this.creatForm();
    this.patchFormWithData(data);
    this.getCategoriesList();
    this.getWorkDaysList();
    this.getCommissions();
    if (this.companyId) {
      this.getRequisiteList(this.companyId);
      this.getRequisiteCardList(this.companyId);
    }
    if (this.updateUrl !== 'new') {
      this.getMerchantUpdate()
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    if (!this.merchantContactJson.get('phoneNumber').value)
      this.merchantContactJson.get('phoneNumber').setValue(null);

    if (!this.merchantContactJson.get('email').value)
      this.merchantContactJson.get('email').setValue(null);

    if (!this.merchantContactJson.get('managerName').value)
      this.merchantContactJson.get('managerName').setValue(null);

    if (!this.merchantContactJson.get('managerPhoneNumber').value)
      this.merchantContactJson.get('managerPhoneNumber').setValue(null);

    this.submitted = true;
    this.form.get('companyId').setValue(this.companyId);
    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.updateMerchant({...this.merchantDetail, ...this.form.value});
    } else {
      $observer = this.service.createMerchant(this.form.value);
    }
    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset()
          this.location.back();
        } else {
          setValidationErrors(this.form, res);
          setNestedGroupValidationErrors(this.merchantContactJson, res);
        }
      });
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

  changeIsVerified(value: boolean): void {
    if (value === false) {
      if (this.form.value.isActive) {
        this.messageService.add({
          severity: ToastEnum.ERROR,
          summary: 'Невозможно изменить статус проверки на "не проверено" при статусе мерчанта "Активный"'
        });
        this.form.get('isVerified').setValue(true)
      }
    }
  }

  changeCategories(event: string): void {
    if (!event) {
      this.form.patchValue({subCategoryId: null});
    }
    this.getSubCategoriesList(event);
  }

  getBankName(event: ISelect | null): void {
    queueMicrotask(() => {
      this.bankName = event?.bankName ?? null;
      this.selectedAccountTypeId.set(
        event?.accountTypeId ?? null
      );

      if (!this.isTreasury()) {
        this.clearTreasuryFields();
      }
    });
  }

  getCardBankName(event: ISelect | null): void {
    queueMicrotask(() => {
      this.cardBankName = event?.bankName ?? '';
      this.inn = event?.inn ?? '';
      this.receiver = event?.receiver ?? '';
    });
  }


  changeMap(event: any): void {
    this.form.get('latitude').setValue(String(event.latitude));
    this.form.get('longitude').setValue(String(event.longitude));
  }

  getCheckedRequisite(): void {
    this.isHidden.set(!this.isHidden());
    if (this.isHidden()) {
      this.accountService.getChecked(this.form.get('paymentAccountId').value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: any) => {
          if (res.status) {
            this.isHidden.set(res.data);
          }
        });
    }
  }

  openWorkingDayModal(): void {
    const dialogRef = this.dialog.open(WorkingDayEditComponent, {
      width: '800px',
      data: {
        modalMode: true,
        workingDayId: null
      }
    });

    dialogRef.afterClosed().subscribe((result: { id: string } | undefined) => {
      if (result?.id) {
        this.form.get('merchantWorkDayId').setValue(result.id);
        this.getWorkDaysList({
          filters: `id==${result.id}`
        });
        this.form.updateValueAndValidity({onlySelf: false, emitEvent: true});
      }
    });
  }

  uploadLogo(file: FormData): Observable<IHttpResponse<IMerchantDetail>> {
    return this.service.uploadLogo(file);
  }

  private patchFormWithData(data: IIRetailOutletDetail | null): void {
    if (!data) return;

    this.form.patchValue({
      name: data.name,
      address: data.address,
      description: data.description,
      merchantContactJson: {
        email: data.email,
        managerName: data.managerFullName,
        managerPhoneNumber: data.managerPhoneNumber,
      },
    });

    queueMicrotask(() => {
      this.form.patchValue({
        paymentAccountId: data.paymentAccountId
      });
    });
  }

  private getCommissions(): void {
    this.commissionService.getCommissionDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.commissions = res.data)
  }

  private getCategoriesList(): void {
    this.categoryService.getCategoryDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.categories = res.data)
  }

  private getSubCategoriesList(categoryId: string): void {
    if (!categoryId) return;
    this.queryParams.filters = `parentId==${categoryId}`;
    this.subCategoryService.getSubcategoryDictionary(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.subCategories = res.data)
  }

  private getWorkDaysList(params = this.queryParams): void {
    const finalParams = {
      pageSize: 50,
      pageNumber: 1,
      ...params
    };

    this.workDayService.getWorkDayDictionary(finalParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.workingDays = res.data);
  }

  private getRequisiteList(companyId: string, page = 1): void {
    if (!companyId) return;

    this.isLoadingMore.set(true);

    this.accountService.getRequisites(companyId, {
      page,
      pageSize: 15
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingMore.set(false))
      )
      .subscribe({
        next: (res) => {
          const data = res.data ?? [];

          this.requisites = page === 1
            ? data
            : [...this.requisites, ...data];

          this.pagination = res.meta?.pagination;

          this.currentPage.set(page);
        }
      });
  }

  onLoadMore(): void {
    if (this.isLoadingMore() || !this.hasMorePages()) {
      return;
    }

    const nextPage = this.currentPage() + 1;

    this.getRequisiteList(this.companyId, nextPage);
  }

  private getRequisiteCardList(companyId: string): void {
    this.accountService.getRequisitesCards(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.requisitesCard = res.data)
  }

  private clearTreasuryFields(): void {
    this.form.patchValue({
      merchantGovernmentIncomeId: null,
      merchantGovernmentDepartmentId: null,
      merchantGovernmentAreaId: null
    });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [],
      extCodeEqms: [null, digitsOnlyValidator()],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      companyId: [this.companyId],
      regionId: ['', Validators.required],
      areaId: ['', Validators.required],
      cityId: ['', [Validators.required]],
      issueMoneyPaymentPurposeId: [''],
      paymentAccountId: [null],
      paymentCardAccountId: [],
      address: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(255)]],
      merchantContactJson: this.fb.group({
        phoneNumber: [null, PhoneValidator.validate()],
        email: [null, Validators.email],
        managerName: [null, Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+([ -][a-zA-Zа-яёА-ЯЁ]+)*$')],
        managerPhoneNumber: [null, PhoneValidator.validate()],
      }),
      latitude: [null, [
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      longitude: [null, [
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      isVerified: [false],
      isShowOnMain: [false],
      description: [null, Validators.maxLength(255)],
      categoryId: ['', Validators.required],
      subCategoryId: [''],
      position: [''],
      merchantWorkDayId: ['', Validators.required],
      imgLoginMain: [''],
      imgLogoList: [''],
      imgLogoDetail: [''],
      merchantGovernmentIncomeId: [''],
      merchantGovernmentDepartmentId: [''],
      merchantGovernmentAreaId: [''],
    });
  }

  private getMerchantUpdate(): void {
    this.service.getMerchantUpdateDetail(this.merchantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.companyId = res.data.companyId;
        this.fileStorageUrl = res.meta.fileStorageUrl;
        this.fileStorageToken = res.meta.fileStorageToken;
        this.getRequisiteList(this.companyId);
        this.getRequisiteCardList(this.companyId);
        this.form.patchValue(res.data);
        this.form.updateValueAndValidity();
        this.merchantDetail = res.data;
        this.dataSource = res.data;
        this.showAmount = !!res.data.paymentCardAccountId;
        this.breadcrumbService.set('@merchantDetail', this.merchantDetail.name);
      });
  }
}
