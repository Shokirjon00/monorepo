import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPaymentContinueRulesDetail } from '@modules/payment-continue-rules/interfaces/payment-continue-rules-detail.interface';
import { environment as env, environment } from '@environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@core/enums/toast-enum';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { PaymentContinueRulesService } from '@modules/payment-continue-rules/services/payment-continue-rules.service';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';
import { ValidatorComponent } from '@shared/components/validator/validator.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';

@Component({
  standalone: true,
  selector: 'em-payment-continue-rules-edit',
  templateUrl: './payment-continue-rules-edit.component.html',
  styleUrls: ['./payment-continue-rules-edit.component.scss'],
  providers: [PaymentContinueRulesService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    AutocompleteComponent,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent,
    ]
})
export class PaymentContinueRulesEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  ruleDetail: IPaymentContinueRulesDetail
  api = environment.api;
  submitted: boolean = false;
  apiPaymentStatusesPath = `${env.api.paymentStatuses}/${env.api.dictionary}`;
  apiPaymentSyncStatusesPath = `${env.api.paymentSyncStatuses}/${env.api.dictionary}`;
  apiGatewaysPath = `${env.api.gateways}/${env.api.dictionary}`;
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(PaymentContinueRulesService);
  private readonly activatedRoute = inject(ActivatedRoute);

  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  rulesId = this.activatedRoute.snapshot.parent.params['rulesId'];

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
      this.getDetail();
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
      $observer = this.service.update({...this.ruleDetail, ...this.form.value});
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
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
          this.messageService.add({severity: ToastEnum.WARN, summary: res.errors.requestError[0]})
        }
      });
  }


  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.rulesId],
      paymentStatusId: [null, Validators.required],
      paymentSyncStatusId: null,
      fromGatewayId: [null, Validators.required],
      toGatewayId: [null, Validators.required],
      isActive: [false]
    });
  }

  private getDetail(): void {
    this.service.getPaymentContinueRuleDetail(this.rulesId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.ruleDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
        }
      });
  }

}
