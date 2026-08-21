import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common'
import { MessageService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import {
  IPaymentRefundReasonDetail
} from '@modules/directory/payment-refund-reason/interfaces/payment-refund-reason-detail.interface';
import {
  PaymentRefundReasonService
} from '@modules/directory/payment-refund-reason/services/payment-refund-reason.service';
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-payment-refund-reason-edit',
  templateUrl: './payment-refund-reason-edit.component.html',
  styleUrls: ['./payment-refund-reason-edit.component.scss'],
  providers: [PaymentRefundReasonService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class PaymentRefundReasonEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  refundReason: IPaymentRefundReasonDetail;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(PaymentRefundReasonService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private refundReasonId = this.activatedRoute.snapshot.params['id'];
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
      this.service.getPaymentRefundReasonUpdate(this.refundReasonId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.refundReason = res.data;
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

    let $observer: Observable<any>;

    if (this.updateUrl !== 'new') {
      $observer = this.service.updateRefundReason({...this.refundReason, ...this.form.value});
    } else {
      $observer = this.service.createRefundReason(this.form.value);
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
          this.back()
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.refundReasonId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false]
    });
  }
}
