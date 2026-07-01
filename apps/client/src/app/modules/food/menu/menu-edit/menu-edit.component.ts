import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { ProductsService } from '@modules/food/menu/services/product.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { SvgIconComponent } from 'angular-svg-icon';
import { ToastModule } from '@shared/components/toast/toast.module';
import { ProductApplicationsService } from '@modules/food/menu/services/product-application.service';
import { ComparableVariant, IMenuDetail } from '@modules/food/menu/interfaces/menu-detail.interface';
import { delay, finalize, forkJoin, Observable, of } from 'rxjs';
import { ProductDictionariesService } from '@modules/food/menu/services/product-dictionary.service';
import { ISelect } from '@core/interfaces/select.interface';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ToastEnum } from '@eskhata/util';
import { mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { MessageService } from '@core/services/message.service';
import { DecimalPrecisionDirective } from '@core/directives/decimal-precision.directive';
import { normalizeVariant } from '@modules/food/menu/utils/variant-normalizer.util';
import { diffVariant } from '@modules/food/menu/utils/variant-diff.util';

@Component({
  selector: 'em-menu-edit',
  standalone: true,
  imports: [
    EmHeaderComponent,
    SvgIconComponent,
    ToastModule,
    EskhataBankLoaderComponent,
    ValidatorModule,
    ReactiveFormsModule,
    SimpleSelectListComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragPreview,
    DecimalPrecisionDirective,
  ],
  providers: [MessageService, ProductsService, ProductDictionariesService, ProductApplicationsService],
  templateUrl: './menu-edit.component.html',
  styleUrl: './menu-edit.component.scss',
})
export class MenuEditComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  submitted: boolean = false;
  title: string = 'Заявка на добавление блюда';
  categories: ISelect[];
  unities: ISelect[];
  productApplicationType: string = 'CREATE';
  productId: string;
  fileStorageUrl: string;

  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsService = inject(ProductsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(ProductDictionariesService);
  private readonly applicationsService = inject(ProductApplicationsService);

  private mode = this.activatedRoute.snapshot.data['mode'];
  private initialData: any;
  private variantFiles: Record<number, File> = {};

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get variants(): FormArray {
    return this.form?.get('productVariants') as FormArray;
  }

  getVariantControls(index: number): { [key: string]: AbstractControl } {
    const variantGroup = this.variants.at(index) as FormGroup;
    return variantGroup.controls;
  }

  getPriceControls(index: number): { [key: string]: AbstractControl } {
    const priceGroup = this.getVariantControls(index)['price'] as FormGroup;
    return priceGroup.controls;
  }

  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.params['id'];
    this.createForm();

    forkJoin([this.service.getCategoryDictionary(), this.service.getUnitDictionary()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([categoriesRes, unitiesRes]) => {
        this.categories = categoriesRes.data;
        this.unities = unitiesRes.data;

        if (this.mode === 'update') {
          this.productApplicationType = null;
          this.initDataApplication(this.productId);
        } else if (this.mode === 'modify') {
          this.productApplicationType = 'UPDATE';
          this.initData(this.productId);
        }
      });
  }

  back(): void {
    this.location.back();
  }

  addVariant(): void {
    this.variants.push(this.createVariant());
    this.updateSortFields();
  }

  drop(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.variants.controls, event.previousIndex, event.currentIndex);
    this.updateSortFields();
  }

  updateSortFields(): void {
    this.variants.controls.forEach((ctrl, index) => {
      ctrl.get('sort')?.setValue(index);
    });
  }

  onFileSelected(event: Event, index: number, compress: boolean): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files?.length) return;

    const file = fileInput.files[0];

    this.variantFiles[index] = file;

    this.uploadVariantImage(file, index, compress);
  }

  onCompressChange(index: number, compress: boolean): void {
    const file = this.variantFiles[index];

    if (!file) return;

    this.uploadVariantImage(file, index, compress);
  }

  isCompressDisabled(index: number): boolean {
    const imageId = this.variants.at(index).get('image')?.value;
    const hasFile = !!this.variantFiles[index];

    return imageId && !hasFile;
  }

  private uploadVariantImage(file: File, index: number, compress: boolean): void {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('HasResize', 'false');
    formData.append('compress', String(compress));

    this.service.uploadImage(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (!response.status) {
            this.showUploadError(response.message);
            return;
          }

          const imageId = response.data['id'];
          this.variants.at(index).get('image')?.setValue(imageId);
          this.fileStorageUrl = response.meta.file['url'];
        },
        error: err => this.showUploadError(err?.message)
      });
  }

  private showUploadError(message?: string): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: message || 'Произошла ошибка при загрузке файла',
    });
  }

  private initDataApplication(id: string): void {
    this.title = 'Редактирование заявки';
    this.applicationsService
      .getUpdateDetail(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: IHttpResponse<IMenuDetail>) => {
        if (res.status) {
          this.initForm(res.data);
          this.fileStorageUrl = res.meta.file['url'];
        } else {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message,
          });
        }
      });
  }

  private initData(id: string): void {
    this.title = 'Редактирование существующего блюда';
    this.productsService
      .getUpdateDetail(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: IHttpResponse<IMenuDetail>) => {
        if (res.status) {
          res.data.productName = res.data.name;
          res.data.productDescription = res.data.description;
          res.data.dimensionUnit = res.data.dimensionUnitName;
          this.initForm(res.data);
          this.form.updateValueAndValidity();
          this.fileStorageUrl = res.meta.file['url'];
        } else {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message,
          });
        }
      });
  }

  private initForm(data: IMenuDetail): void {
    const fullName = sessionStorage.getItem('userFullName');

    const normalizedData = {
      ...data,
      productDescription: data.productDescription ?? null,
    };

    this.initialData = structuredClone(normalizedData);

    this.form = this.fb.group({
      productId: [normalizedData.id],
      categoryId: [normalizedData.categoryId],
      productName: [normalizedData.productName, [Validators.required, Validators.maxLength(100)]],
      dimensionUnit: [normalizedData.dimensionUnitName],
      productDescription: [normalizedData.productDescription, Validators.maxLength(255)],
      merchantUserFullName: [fullName],
      productApplicationType: [this.productApplicationType],
      productVariants: this.fb.array(
        normalizedData.productVariants.map((variant: any) => this.createVariant(variant))
      ),
      comment: [{ value: normalizedData.comment, disabled: true }],
      isActive: [normalizedData.isActive],
    });
  }

  private emptyResult() {
    return {
      onlyStatusOrPrice: false,
      changedVariants: [] as any[],
      productIsActive: this.form.get('isActive')?.value ?? true,
    };
  }

  private productChanged(current: any): boolean {
    if (!this.initialData) return false;

    const fields: Array<[any, any]> = [
      [current.productName, this.initialData.productName],
      [current.productDescription, this.initialData.productDescription],
      [current.categoryId, this.initialData.categoryId],
      [current.dimensionUnit, this.initialData.dimensionUnit],
    ];

    return fields.some(([curr, init]) => curr !== init);
  }

  private detectVariantChanges() {
    if (!this.initialData) return this.emptyResult();

    const current = this.form.getRawValue();

    const initialMap = new Map<string, ComparableVariant>(
      this.initialData.productVariants.map((v: any) => [
        v.productVariantId,
        normalizeVariant(v),
      ])
    );

    let onlyStatusOrPrice = true;
    const changedVariants = [];

    for (const v of current.productVariants) {
      const curr = normalizeVariant(v);
      const init = initialMap.get(curr.id);

      if (!init) {
        onlyStatusOrPrice = false;
        continue;
      }

      const diff = diffVariant(init, curr);

      if (!diff.changed) continue;

      if (diff.structuralChanged) {
        onlyStatusOrPrice = false;
      }

      if (diff.onlyStatusOrPrice) {
        changedVariants.push({
          productVariantId: curr.id,
          isActive: curr.isActive,
          price: {
            amount: curr.price,
            currencyCode: v.price?.currencyCode ?? 'TJS',
          }
        });
      }
    }

    if (this.productChanged(current)) {
      onlyStatusOrPrice = false;
    }

    return {
      onlyStatusOrPrice,
      changedVariants,
      productIsActive: current.isActive,
    };
  }

  private createForm(): void {
    let fullName = sessionStorage.getItem('userFullName');

    this.form = this.fb.group({
      productId: [null],
      productName: [
        '',
        [Validators.required, WhiteSpaceValidator.validate(), Validators.minLength(3), Validators.maxLength(100)],
      ],
      categoryId: ['', [Validators.required]],
      dimensionUnit: ['', [Validators.required]],
      merchantUserFullName: [fullName],
      productDescription: [null, Validators.maxLength(255)],
      productApplicationType: [this.productApplicationType],
      productVariants: this.fb.array([this.createVariant()]),
    });
  }

  private createVariant(variant?: any): FormGroup {
    const group = this.fb.group({
      name: [
        variant?.name || '',
        [Validators.required, WhiteSpaceValidator.validate(), Validators.minLength(3), Validators.maxLength(100)],
      ],
      productVariantId: [variant?.productVariantId || null],
      sort: [variant?.sort ?? 0],
      dimensionValue: [variant?.dimensionValue ?? null],
      image: [variant?.image ?? null, Validators.required],
      isActive: [variant?.isActive ?? true],
      price: this.fb.group({
        amount: [variant?.price?.amount ?? null],
        currencyCode: [variant?.price?.currencyCode ?? 'TJS'],
      }),
    });

    if (this.mode === 'update') {
      group.get('isActive')?.disable();
      group.get('price.amount')?.disable();
    }

    return group;
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.submitted = true;

    const request$ = this.buildRequest();

    request$
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.status ? 'Успешно' : 'Неуспешно',
          });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => (this.submitted = false)),
        takeUntilDestroyed(this.destroyRef)
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

  private validateForm(): boolean {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Неправильно заполнены данные!',
      });
      return false;
    }

    return true;
  }

  private buildRequest(): Observable<IHttpResponse<any>> {
    const current = this.form.getRawValue();

    const { onlyStatusOrPrice, changedVariants, productIsActive } = this.detectVariantChanges();

    if (this.mode === 'modify' && onlyStatusOrPrice && changedVariants.length) {
      return this.productsService.changeActiveStatus(this.productId, {
        isActive: productIsActive,
        productVariants: changedVariants,
      });
    }

    if (this.mode === 'update') {
      return this.applicationsService.update(this.productId, current);
    }

    return this.applicationsService.create(current);
  }
}
