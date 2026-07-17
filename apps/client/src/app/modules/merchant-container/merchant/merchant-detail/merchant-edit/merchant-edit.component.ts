import { Component, computed, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISelect } from '@core/interfaces/select.interface';
import { finalize, map, Observable, of, Subject, timer } from 'rxjs';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IMerchantDetail } from '@modules/merchant-container/merchant/interfaces/merchant-detail.interface';
import { CategoryService } from '@core/services/category.service';
import { WorkingDayService } from '@core/services/working-day.service';
import { SubcategoryService } from '@core/services/subcategory.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { environment as env } from '@environments/environment';
import { Location } from '@angular/common';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { HeaderService } from '@core/services/header.service';
import { PhoneValidator } from '@core/validators/phone-validator';
import { mergeMap } from 'rxjs/operators';
import { setNestedGroupValidationErrors, setValidationErrors } from '@core/validators/set-validation-errors';
import { compareForm } from '@core/utils/compare-form';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { SharedModule } from '@shared/shared.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ToastModule } from '@shared/components/toast/toast.module';
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { isPhone } from '@core/helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'em-merchant-edit',
  templateUrl: './merchant-edit.component.html',
  styleUrls: ['./merchant-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorModule,
    NgxMaskDirective,
    SharedModule,
    EskhataBankLoaderComponent,
    ToastModule,
    AutocompleteComponent,
    SimpleSelectListComponent,
    EmHeaderComponent,
  ],
  providers: [MerchantService, provideNgxMask(), WorkingDayService],
})
export class MerchantEditComponent implements OnInit {
  form: FormGroup;
  regions: ISelect[];
  categories: ISelect[];
  subCategories: ISelect[];
  workingDays: ISelect[];
  merchantDetail: IMerchantDetail;
  areaDisabled: boolean;
  cityDisabled: boolean;
  submitted: boolean = false;
  regionFilter = {};
  areaFilter = {};
  regionApi = `${env.api.regions}/${env.api.dictionary}`;
  areaApi = `${env.api.areas}/${env.api.dictionary}`;
  cityApi = `${env.api.cities}/${env.api.dictionary}`;
  categoryApi = `${env.api.categories}/${env.api.dictionary}`;
  invalidCoordinates: boolean;
  selectedWorkDayId: string | null = null;

  readonly isEditMode: WritableSignal<boolean> = signal(false);
  readonly workDayAction = computed(() => (this.isEditMode() ? 'Изменить рабочие дни' : 'Выберите рабочие дни'));

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly location = inject(Location);
  private readonly service = inject(MerchantService);
  private readonly headerService = inject(HeaderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly categoryService = inject(CategoryService);
  private readonly workDayService = inject(WorkingDayService);
  private readonly subCategoryService = inject(SubcategoryService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly isMobile = isPhone();
  private merchantId: string;
  private canDeactivate$ = new Subject<boolean>();
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  queryParams: IFilterParams = {
    filters: '',
  };

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get contactsControls(): { [key: string]: AbstractControl } {
    return this.merchantContactJson.controls;
  }

  get merchantContactJson(): FormGroup {
    return this.form.get('merchantContactJson') as FormGroup;
  }

  ngOnInit(): void {
    this.isEditMode.set(this.updateUrl !== 'new');
    this.initData();
    this.createForm();
    this.getCategoriesList();
    this.getWorkDaysList();
    this.getDetail();
  }

  initData(): void {
    this.headerService
      .getMerchantId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(merchantId => (this.merchantId = merchantId));
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showErrorToast();
      return;
    }

    this.normalizeFormValues();

    this.submitted = true;
    const request$ = this.isEditMode() ? this.updateMerchant() : this.createMerchant();

    this.handleRequest(request$);
  }

  back(): void {
    this.location.back();
  }

  changeMap(event: any): void {
    this.form.get('latitude').setValue(String(event.latitude));
    this.form.get('longitude').setValue(String(event.longitude));
  }

  changedRegion(regionId: string): void {
    if (regionId === '') {
      this.form.get('areaId').setValue('');
      this.form.get('cityId').setValue('');
      this.areaDisabled = false;
    } else {
      this.areaDisabled = true;
    }
    this.regionFilter = { regionId: regionId };
  }

  workdayClick(): void {
    if (this.merchantDetail?.merchantWorkDayId) {
      this.router.navigate(['/merchant', 'merchant', 'work-day', this.merchantDetail.merchantWorkDayId]).catch();
    }
  }

  changedArea(areaId: string): void {
    if (areaId === '') {
      this.form.get('cityId').setValue('');
      this.cityDisabled = false;
    } else {
      this.cityDisabled = true;
    }
    this.areaFilter = { areaId: areaId };
  }

  changeCategories(event: string): void {
    if (!event) {
      this.form.patchValue({ subCategoryId: null });
    }
    this.getSubCategoriesList(event);
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        data: {
          title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
          successButtonText: 'Да',
          cancelButtonText: 'Нет',
        },
        maxWidth: '90vw',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  private getDetail(): void {
    if (this.isEditMode()) {
      this.service
        .getMerchantUpdateDetail(this.merchantId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          if (res.status) {
            this.merchantDetail = res.data;
            this.form.patchValue(res.data);
            this.selectedWorkDayId = res.data.merchantWorkDayId;
          }
        });
    }
  }

  private getCategoriesList(): void {
    this.categoryService
      .getCategoryDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => (this.categories = res.data));
  }

  private getSubCategoriesList(categoryId: string): void {
    this.queryParams.filters = `parentId==${categoryId}`;
    this.subCategoryService
      .getSubcategoryDictionary(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => (this.subCategories = res.data));
  }

  private showErrorToast(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!',
    });
  }

  private normalizeFormValues(): void {
    ['phoneNumber', 'email', 'managerName', 'managerPhoneNumber'].forEach(field => {
      if (!this.merchantContactJson.get(field)?.value) {
        this.merchantContactJson.get(field)?.setValue(null);
      }
    });
  }

  private updateMerchant(): Observable<any> {
    return this.service.updateMerchant({
      ...this.merchantDetail,
      ...this.form.value,
    });
  }

  private createMerchant(): Observable<any> {
    return this.service.createMerchant(this.form.value);
  }

  private handleRequest(request$: Observable<any>): void {
    request$
      .pipe(
        mergeMap(res => timer(res.status ? 2000 : 0).pipe(map(() => res))),
        finalize(() => (this.submitted = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => this.handleResponse(res));
  }

  private handleResponse(res: any): void {
    if (res.status) {
      this.form.reset();
      this.back();
      return;
    }

    setValidationErrors(this.form, res);
    setNestedGroupValidationErrors(this.merchantContactJson, res);

    if (res.errors?.isActive) {
      const title = res.errors.isActive[0];
      this.dialog.open(AlertDialogComponent, {
        data: { title },
        maxWidth: '90vw',
      });
    }
  }

  private getWorkDaysList(): void {
    this.workDayService
      .getWorkDayDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.workingDays = res.data;
          this.selectedWorkDayId = this.form.get('merchantWorkDayId')?.value || this.selectedWorkDayId;
        }
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [],
      name: [
        '',
        [Validators.required, WhiteSpaceValidator.validate(), Validators.minLength(3), Validators.maxLength(100)],
      ],
      regionId: ['', [Validators.required]],
      areaId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      address: [
        '',
        [Validators.required, WhiteSpaceValidator.validate(), Validators.minLength(3), Validators.maxLength(255)],
      ],
      merchantContactJson: this.fb.group({
        phoneNumber: [null, PhoneValidator.validate()],
        email: [null, Validators.email],
        managerName: [null, Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+([ -][a-zA-Zа-яёА-ЯЁ]+)*$')],
        managerPhoneNumber: [null, PhoneValidator.validate()],
      }),
      merchantWorkDayId: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      subCategoryId: ['', [Validators.required]],
      latitude: [null, [WhiteSpaceValidator.validate(), Validators.maxLength(50)]],
      longitude: [null, [WhiteSpaceValidator.validate(), Validators.maxLength(50)]],
      description: [null, Validators.maxLength(255)],
      isActive: [false],
    });
  }

  private hasChanges(): boolean {
    if (!this.form || !this.merchantDetail) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && compareForm(this.merchantDetail, this.form.value) && this.form.touched;
  }
}
