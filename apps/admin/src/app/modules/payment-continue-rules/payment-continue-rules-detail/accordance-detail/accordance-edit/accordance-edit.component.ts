import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment as env, environment } from '@environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from '@eskhata/data-access';
import { DestroyableComponent } from '@eskhata/util';
import { IPaymentContinueRuleAccordanceDetail } from '@modules/payment-continue-rules/interfaces/payment-continue-rule-accordance-detail.interface';
import { PaymentContinueRuleAccordancesService } from '@modules/payment-continue-rules/services/payment-continue-rule-accordances.service';
import { ToastEnum } from '@eskhata/util';
import { finalize, Observable, of, Subject, takeUntil } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { compareForm } from '@core/utils/compare-form';
import { PaymentContinueRulesService } from '@modules/payment-continue-rules/services/payment-continue-rules.service';
import { IPaymentContinueRules } from '@modules/payment-continue-rules/interfaces/payment-continue-rules.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { AutocompleteComponent, EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-accordance-edit',
  templateUrl: './accordance-edit.component.html',
  styleUrls: ['./accordance-edit.component.scss'],
  providers: [
    PaymentContinueRuleAccordancesService,
    PaymentContinueRulesService
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    AutocompleteComponent,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class AccordanceEditComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  accordanceDetail: IPaymentContinueRuleAccordanceDetail;
  api = environment.api;
  submitted: boolean = false;
  continueDetail: IPaymentContinueRules
  apiPaymentStatusesPath = `${env.api.paymentStatuses}/${env.api.dictionary}`;
  apiPaymentSyncStatusesPath = `${env.api.paymentSyncStatuses}/${env.api.dictionary}`;

  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  private readonly messageService = inject(MessageService);
  private readonly continueService = inject(PaymentContinueRulesService);
  private readonly service = inject(PaymentContinueRuleAccordancesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  rulesId = this.activatedRoute.snapshot.parent.parent.params['rulesId'] ?? this.activatedRoute.snapshot.parent.params['rulesId'];
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  private accordanceId = this.activatedRoute.snapshot.params['accordanceId'];
  private canDeactivate$ = new Subject<boolean>();

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.creatForm();
    this.continueService.getPaymentContinueRuleById(this.rulesId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.continueDetail = res.data;
        }
      });
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
      $observer = this.service.update({...this.accordanceDetail, ...this.form.value});
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
          this.messageService.add({severity: ToastEnum.WARN, summary: res.errors.message?.[0]})

        }
      });
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '90vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  back(): void {
    this.location.back()
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.accordanceId],
      paymentContinueRuleId: [this.rulesId, Validators.required],
      paymentSyncStatusId: null,
      paymentStatusId: [null, Validators.required],
      message: [''],
      isActive: [false]
    });
  }

  private hasChanges(): boolean {
    if (!this.form) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && compareForm(this.accordanceDetail, this.form.value) && this.form.touched;
  }

  private getDetail(): void {
    this.service.getAccordanceDetail(this.accordanceId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
          if (res.status) {
            this.accordanceDetail = res.data;
            this.form.patchValue(res.data);
          }
        }
      );
  }
}
