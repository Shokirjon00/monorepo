import { Component, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ICashbackRates } from '@modules/directory/cashback-rates/interfaces/cashback-rates.interface';
import { CashbackRatesService } from '@modules/directory/cashback-rates/services/cashback-rates.service';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { GradationValidator } from '@core/validators/gradation-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { NgxMaskDirective } from "ngx-mask";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-cashback-rates-edit',
  templateUrl: './cashback-rates-edit.component.html',
  styleUrls: ['./cashback-rates-edit.component.scss'],
  providers: [CashbackRatesService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    NgxMaskDirective,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class CashbackRatesEditComponent extends EMBaseForm implements OnInit {
  cashbackRatesDetail: ICashbackRates;
  form: FormGroup;
  loading: boolean;
  submitted: boolean = false;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cashbackService = inject(CashbackRatesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  cashbackRateId = this.activatedRoute.snapshot.params['id'];
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    dialog: MatDialog,
    location: Location,
  ) {
    super(location, dialog);
    this.form = this.fb.group({
      id: [this.cashbackRateId ? this.cashbackRateId : ''],
      name: ['', [Validators.required, WhiteSpaceValidator.validate(), Validators.maxLength(100)]],
      isActive: [false],
      cashbackGradations: this.fb.array([])
    });
  }

  get cashBackArray(): FormArray {
    return this.form.get('cashbackGradations') as FormArray;
  }

  get cashBackControlsArray(): FormGroup[] {
    return this.cashBackArray.controls as FormGroup[];
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    if (this.updateUrl !== 'new') {
      this.cashbackService.getCashbackDetail(this.cashbackRateId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.cashbackRatesDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          res.data.cashbackGradations.forEach(item => {
            const formGroup = this.creatCashbackForm();
            formGroup.patchValue(item);
            this.cashBackArray.push(formGroup);
          });
        });
    } else {
      this.addCashback();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched()
    this.cashBackControlsArray.forEach((c) => c.markAllAsTouched())

    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.cashbackService.updateCashback({...this.cashbackRatesDetail, ...this.form.value});
    } else {
      $observer = this.cashbackService.createCashback(this.form.value);
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
            this.router.navigate(['directory/cashback-rates']).catch();
          } else {
            setValidationErrors(this.form, res);
            for (const key in res.errors) {
              if (key.startsWith('commissionGradations')) {
                const result = key.split(/[\[\].\s]/);
                const commissionKey = result[3][0].toLowerCase() + result[3].slice(1)
                const index = Number(result[1]);
                const field = this.cashBackArray.at(index).get(commissionKey);
                if (res.errors.hasOwnProperty(key) && field) {
                  field.setErrors({serverErrors: res.errors[key]});
                }
              }
            }
          }
        }
      );
  }

  addCashback(): void {
    const formGroup = this.creatCashbackForm();
    this.cashBackArray.push(formGroup);
  }

  deleteCashBack(index: number): void {
    this.cashBackArray.removeAt(index);
  }

  private creatCashbackForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      minValue: new FormControl('0'),
      maxValue: new FormControl('0'),
      value: new FormControl('0'),
      isPercentage: new FormControl(false)
    }, [GradationValidator.IsPercentValidator()]);
  }
}
