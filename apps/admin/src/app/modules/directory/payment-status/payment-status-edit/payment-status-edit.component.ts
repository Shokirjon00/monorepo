import { Component, inject, Input, OnInit } from '@angular/core';
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IParam } from "@core/interfaces";
import { environment as env, } from "@environments/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "@core/services";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { PaymentStatusDetailService } from "@modules/directory/payment-status/services/payment-status.service";
import { IPaymentStatusDetail } from "@modules/directory/payment-status/interfaces/payment-status-detail.interfaces";
import { IHttpResponse } from "@core/interfaces/http-response.interface";

@Component({
  selector: 'em-payment-status-edit',
  imports: [
    EmHeaderComponent,
    SvgIconComponent,
    ReactiveFormsModule,
    NgxPermissionsModule,
    ValidatorComponent,
    AutocompleteComponent,
    ToastComponent
  ],
  templateUrl: './payment-status-edit.component.html',
  styleUrl: './payment-status-edit.component.scss',
  providers: [PaymentStatusDetailService],
})
export class PaymentStatusEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  paymentStatusDetail: IPaymentStatusDetail;
  paymentStatusApi = `${env.api.paymentStatusDetailTypes}/${env.api.dictionary}`;
  submitted: boolean = false;

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private service = inject(PaymentStatusDetailService);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  public paymentStatusId = this.activatedRoute.snapshot.params['id'];
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
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.service.PaymentStatusDetail(this.paymentStatusId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.paymentStatusDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
        });
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<IHttpResponse<IPaymentStatusDetail>>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.updatePaymentStatusDetail({...this.paymentStatusDetail, ...this.form.value});
    } else {
      $observer = this.service.createPaymentStatusDetail(this.form.value);
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
          this.form.reset();
          this.router.navigate(['directory/payment-status-detail']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.paymentStatusId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      code: ['', [
        WhiteSpaceValidator.validate(),
        Validators.required]],
      type: ['',[
        WhiteSpaceValidator.validate(),
        Validators.required]],
      isActive: [false]
    });
  }
}
