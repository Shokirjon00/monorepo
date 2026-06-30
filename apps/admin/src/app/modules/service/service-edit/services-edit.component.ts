import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ServiceService } from "@modules/service/services/service.service";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { IServiceDetail } from "@modules/service/interfaces/service-detail.interface";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { GatewaysService } from "@core/services/gateways.service";
import { ISelect } from "@core/interfaces";
import { MerchantService } from "@modules/client/merchant/services/merchant.service";
import { UploadLogoComponent } from "@shared/components/upload-logo/upload-logo.component";
import { IHttpResponse } from "@core/interfaces/http-response.interface";

@Component({
  standalone: true,
  selector: 'em-services-edit',
  templateUrl: './services-edit.component.html',
  styleUrls: ['./services-edit.component.scss'],
  providers: [ServiceService, MerchantService],
  imports: [
    ReactiveFormsModule,
    EmHeaderComponent,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    SimpleSelectListComponent,
    UploadLogoComponent,
    EbLoaderComponent,
    ToastComponent
  ]
})
export class ServicesEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: '.jpg, .jpeg', uploadPath: 'merchants/upload_logo'
  };
  fileStorageUrl: string;
  fileStorageToken: string;
  customLogoKey: string = 'icon';
  form: FormGroup = new FormGroup({});
  servicesDetail: IServiceDetail;
  submitted: boolean = false;
  gateways: ISelect[];

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ServiceService);
  private readonly messageService = inject(MessageService);
  private readonly gatewaysService = inject(GatewaysService);

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }
  updateUrl = this.route.snapshot.routeConfig.path;
  servicesId = this.route.snapshot.params['id'];
  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.getGateWays();
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.getServicesUpdate();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    this.form.get('id').setValue(this.servicesId);
    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.getServicesDetail({...this.servicesDetail, ...this.form.value});
    } else {
      $observer = this.service.create(this.form.value);
    }
    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset()
          this.location.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private minMaxValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const minValueControl = form.get('minValue');
      const maxValueControl = form.get('maxValue');
      if (!minValueControl || !maxValueControl) {
        return null;
      }
      const minValue = minValueControl.value;
      const maxValue = maxValueControl.value;
      if (minValue !== null && maxValue !== null && minValue >= maxValue) {
        if (minValueControl.value >= maxValue) {
          minValueControl.setValue(maxValue - 1);
        }
        return {minGreaterThanMax: true};
      }
      return null;
    };
  }

  uploadLogo(file: FormData): Observable<IHttpResponse<IServiceDetail>> {
    return this.service.uploadLogo(file);
  }

  private creatForm(): void {
    this.form = this.fb.group({
        id: [this.servicesId],
        iconId: [''],
        name: ['', Validators.required],
        code: [''],
        extCodeAbs: [''],
        extCodeProcessing: [''],
        position: [''],
        gatewayId: [''],
        commissionValue: ['', Validators.required],
        minValue: [''],
        maxValue: [''],
        isActive: [false, Validators.required]
      },
      {validators: this.minMaxValidator()});
  }

  private getGateWays(): void {
    this.gatewaysService.getTypeDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.gateways = res.data
        }
      })
  }

  private getServicesUpdate(): void {
    this.service.getServicesUpdateDetail(this.servicesId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.form.patchValue(res.data);
          this.form.updateValueAndValidity();
          this.servicesDetail = res.data;
          this.dataSource = res.data;
        }
      });
  }
}
