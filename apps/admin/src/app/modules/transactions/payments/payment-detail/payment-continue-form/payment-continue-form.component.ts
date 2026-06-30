import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { SvgIconComponent } from 'angular-svg-icon';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { SharedModule } from '@shared/shared.module';
import { IPaymentDetail } from '@modules/transactions/payments/interfaces';
import { IHeader, IParam, ISelect } from '@core/interfaces';
import { ActivatedRoute } from '@angular/router';
import { HeaderService, MessageService } from '@core/services';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, finalize, mergeMap } from 'rxjs/operators';
import { of, takeUntil } from 'rxjs';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { PaymentContinueFormService } from "@modules/transactions/payments/payment-detail/payment-continue-form/service/payment-continue-form.service";
import { IAction } from "@shared/components/actions/actions.interface";
import { PaymentsInfoConstants } from "@modules/transactions/payments/payment-detail/payment-info/payment-info.constants";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DateTimePipe } from "@core/pipe/date-time.pipe";


@Component({
  standalone: true,
  selector: 'em-payment-continue-form',
  templateUrl: './payment-continue-form.component.html',
  styleUrls: ['./payment-continue-form.component.scss'],
  providers: [PaymentsService, PaymentContinueFormService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgIconComponent,
    SharedModule,
    EmHeaderComponent,
    DateTimePipe,
  ]
})
export class PaymentContinueFormComponent extends DestroyableComponent implements OnInit, OnDestroy {
  submitted = signal(false)
  loading = signal(false);
  paymentDetail: IPaymentDetail;
  paymentStatus: ISelect[];
  form: FormGroup = new FormGroup<any>(
    {
      paymentStatusId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
    }
  );

  header: IHeader = {
    tabShow: false,
    isFilter: false,
    title: 'Редактировать платёж'
  }

  private readonly location = inject(Location);
  private readonly paymentService = inject(PaymentContinueFormService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);
  // TODO: use params || queryParams
  private readonly paymentId = this.activatedRoute.snapshot.params['id'];
  private readonly paymentRoute = this.activatedRoute.snapshot.queryParams['paymentMode']
  actions: IAction[] = PaymentsInfoConstants.getActions(this.paymentId);

  constructor() {
    super();
    this.headerService.setHeader({ title: '' })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.paymentService.paymentUpdate = null;
  }

  ngOnInit(): void {
    if (this.paymentService.paymentUpdate) {
      this.paymentDetail = this.paymentService.paymentUpdate;
      this.getPaymentStatus();
    } else {
      this.updatePayment();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!' });
      return;
    }

    this.submitted.set(true);

    const value = this.form.value;
    value.id = this.paymentDetail.id;

    this.paymentService.updatePayment({ ...value })
      .pipe(
        mergeMap(res => {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          const modesWithContinue = ['parent', 'info', 'history'];

          if (modesWithContinue.includes(this.paymentRoute)) {
            this.continuePayment();
          } else {
            this.location.back();
          }
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  back(): void {
    this.location.back();
  }

  private updatePayment(): void {
    this.loading.set(true);
    this.paymentService.getPaymentForEdit(this.paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentDetail = res.data;
          this.getPaymentStatus();
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
          this.location.back();
        }
      })
  }

  private getPaymentStatus(): void {
    const queryParams: IParam = {
      fromGatewayId: this.paymentDetail.fromGatewayId,
      toGatewayId: this.paymentDetail.toGatewayId,
      paymentStatusId: this.paymentDetail.paymentStatusId
    }
    this.paymentService.getPaymentStatus(queryParams)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.paymentStatus = res.data;
        }
      })
  }

  private continuePayment(): void {
    this.paymentService.getPaymentContinue(this.paymentDetail.id)
      .pipe(
        mergeMap(res => {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
          return of(res).pipe(delay(res.status ? 2000 : 0))
        })
      )
      .subscribe(res => {
        if (res.status) {
          this.location.back();
        }
      })
  }
}
