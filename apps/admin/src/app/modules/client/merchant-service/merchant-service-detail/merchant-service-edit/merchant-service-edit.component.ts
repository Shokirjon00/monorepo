import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup, FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ISelect } from '@eskhata/util';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@eskhata/data-access';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@eskhata/util';
import { mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { EmHeaderComponent, SimpleSelectListComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';

import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { ParamService } from "@modules/client/merchant-service/services/service.service";
import { IMerchantService } from "@modules/client/merchant-service/interfaces/merchant-service.interface";
import { PosTypeService } from "@modules/client/merchant-service/services/posType.service";
import { MerchantServiceService } from "@modules/client/merchant-service/services/merchant-service.service";
import { DeepClone } from "@core/utils/deep-clone";
import { DirectoryOptionsConstants } from "@modules/directory/directory-options/directory-options.constants";

@Component({
  standalone: true,
  selector: 'em-merchant-services-edit',
  templateUrl: './merchant-service-edit.component.html',
  imports: [
    ReactiveFormsModule,
    AngularSvgIconModule,
    NgxPermissionsModule,
    SimpleSelectListComponent,
    ValidatorComponent,
    EbLoaderComponent,
    ToastComponent,
    FormsModule,
    EmHeaderComponent
  ],
  styleUrls: ['./merchant-service-edit.component.scss'],
  providers: [MerchantServiceService, ParamService, PosTypeService]
})
export class MerchantServiceEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  permissions: ISelect[] = [];
  posType: IMerchantService[];
  posTypeName: string;
  merchantDetail: any;
  loading: boolean = false;
  serviceParams: ISelect[] = [];
  submitted: boolean = false;

  private fb = inject(FormBuilder);
  private serviceDictionary = inject(ParamService);
  private posTypeDictionary = inject(PosTypeService);
  private merchantService = inject(MerchantServiceService);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  private readonly serviceId = this.activatedRoute.snapshot.parent.parent.params['serviceId'];
  private readonly merchantId = this.activatedRoute.snapshot.parent.parent.parent.parent.params['merchantId'];
  private readonly merchantIds = this.activatedRoute.snapshot.parent.parent.parent.params['merchantId'];

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  get merchantServiceParams(): FormArray {
    return this.form.get('merchantServiceParams') as FormArray;
  }

  ngOnInit(): void {
    this.createForm();
    this.getParam()
    if (this.updateUrl === 'new') {
      this.getPosTypes();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }

    let $observer: Observable<any>;
    const merchantServiceParamsArray = DeepClone(this.form.controls['merchantServiceParams'].value);
    const checkedItems = merchantServiceParamsArray.filter((item: any) => item.isChecked);

    const merchantId = this.updateUrl != 'new' ? this.merchantId : this.merchantIds;

    const body = {
      merchantId: merchantId,
      posTypeId: this.form.get('posTypeId').value,
      merchantServiceParams: checkedItems
    };
    if (this.updateUrl !== 'new') {
      $observer = this.merchantService.updateService(body);
    } else {
      $observer = this.merchantService.createService(body);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });
          return of(res).pipe(finalize(() => this.submitted = false));
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          setTimeout(() => {
            this.back();
          }, 1500)
          this.form.reset();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  isChecked(id: string): boolean {
    return this.merchantServiceParams.controls.some(param => param.get('id')?.value === id);
  }

  onCheckboxChange(index: number): void {
    for (let i = 0; i < this.merchantServiceParams.length; i++) {
      if (i !== index) {
        this.merchantServiceParams.at(i).get('isToAccount').setValue(false);
      }
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      merchantId: [this.merchantId || this.merchantIds],
      posTypeId: [this.serviceId, Validators.required],
      merchantServiceParams: this.fb.array([])
    });
  }

  private addMerchantServiceParams(): void {
    this.serviceParams.forEach(param => {
      this.merchantServiceParams.push(this.fb.group({
        id: [param.id],
        defaultValue: [''],
        isReadOnly: [false],
        isChecked: [false],
        isToAccount: [false]
      }));
    });
  }

  private getParam(): any {
    const merchantServiceType = DirectoryOptionsConstants.TYPE.find(type => type.id === 1)
    const queryParams = {filters: `typeId==${merchantServiceType.id}`, pageSize: 50};
    this.serviceDictionary.getParamDictionary(queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.serviceParams = res.data;
          this.addMerchantServiceParams();
          if (this.updateUrl !== 'new') {
            this.getDetail();
          }
        }
      });
  }

  private getPosTypes(): void {
    this.posTypeDictionary.getPosTypeDictionary()
      .pipe(
        takeUntil(this.destroyed$))
      .subscribe(res => {
        this.posType = res.data;
      })
  }

  private getDetail(): void {
    this.loading = true;
    this.merchantService.getMerchantServiceUpdate(this.merchantId, this.serviceId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res && res.data) {
          this.posTypeName = res.data.posTypeName;
          this.merchantServiceParams.controls.forEach(control => {
            const matchingParam = res.data.merchantServiceParams.find(param => param.id === control.get('id')?.value);
            if (matchingParam) {
              control.get('defaultValue')?.setValue(matchingParam.defaultValue)
              control.get('isToAccount')?.setValue(matchingParam.isToAccount)
              control.get('isReadOnly')?.setValue(matchingParam.isReadOnly)
              control.get('isChecked')?.setValue(true)
            }
          });
        }
      });
  }
}
