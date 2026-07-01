import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { ICommission } from "@modules/directory/commission/interfaces/commission.interface";
import { IParam } from "@core/interfaces";
import { MatDialog } from "@angular/material/dialog";
import { DatePipe, Location } from "@angular/common";
import { CommissionService } from "@modules/directory/commission/services/commission.service";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "@core/services";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { DateFormatEnum } from "@core/enums/date-format.enum";
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { SelectPeriodDialogComponent } from "@shared/dialogs/select-period-dialog/select-period-dialog.component";
import { GradationValidator } from "@core/validators/gradation-validator";
import { WhiteSpaceValidator } from "@core/validators/white-space-validator";
import { DATE_PATTERN } from "@core/helper";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxMaskDirective } from "ngx-mask";
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import {
  AdvanceCommissionsService
} from "@modules/advance-payments/advance-commissions/services/advance.commissions.service";

@Component({
  selector: 'em-advance-commissions-edit',
  standalone: true,
  imports: [
    EbLoaderComponent,
    EmHeaderComponent,
    FormsModule,
    NgxMaskDirective,
    NgxPermissionsModule,
    ReactiveFormsModule,
    SvgIconComponent,
    ToastComponent,
    ValidatorComponent
  ],
  templateUrl: './advance-commissions-edit.component.html',
  styleUrl: './advance-commissions-edit.component.scss',
  providers: [CommissionService, DatePipe],
})
export class AdvanceCommissionsEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  commissionDetail: ICommission;
  submitted = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);
  private readonly commissionService = inject(AdvanceCommissionsService);

  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  private commissionId = this.activatedRoute.snapshot.params['id'];

  constructor(
    dialog: MatDialog,
    location: Location
  ) {
    super(location, dialog);
    this.initData();
  }

  get commissionArray(): FormArray {
    return this.form.get('commissionGradations') as FormArray;
  }

  get commissionControlsArray(): FormGroup[] {
    return this.commissionArray.controls as FormGroup[];
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    if (this.updateUrl !== 'new') {
      this.loadCommissionDetail();
    } else {
      this.addCommission();
    }
  }

  onSubmit(): void {
    this.markFormAsTouched();

    if (!this.validatePeriod()) return;
    if (this.form.invalid) {
      this.showValidationError();
      return;
    }

    this.submitted.set(true);
    const request$ = this.updateUrl !== 'new'
      ? this.commissionService.updateCommission({ ...this.commissionDetail, ...this.form.value })
      : this.commissionService.createCommission(this.form.value);

    request$
      .pipe(
        mergeMap(res => this.handleResponseMessages(res)),
        finalize(() => this.submitted.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.handleSubmitResult(res));
  }


  deleteCashBack(index: number): void {
    this.commissionArray.removeAt(index);
  }

  addCommission(): void {
    const formGroup = this.createCommissionForm();
    this.commissionArray.push(formGroup);
  }

  getPeriodTime(): void {
    this.dialog.open(SelectPeriodDialogComponent, {
      data: {
        start: this.form.get('startDate').value,
        end: this.form.get('endDate').value,
      },
      disableClose: true,
      panelClass: 'date-picker',
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.form.get('startDate').setValue(res.start.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.get('endDate').setValue(res.end.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.updateValueAndValidity()
        }
      })
  }

  private createCommissionForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      minValue: new FormControl('0'),
      maxValue: new FormControl('0'),
      value: new FormControl('0'),
    }, [GradationValidator.IsPercentValidator()]);
  }

  private initData(): void {
    this.form = this.fb.group({
      id: [this.commissionId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false],
      startDate: [null, [Validators.required, Validators.pattern(DATE_PATTERN)]],
      endDate: [null, [Validators.required, Validators.pattern(DATE_PATTERN)]],
      commissionGradations: this.fb.array([], [Validators.required])
    });
  }

  private loadCommissionDetail(): void {
    this.commissionService.getCommissionDetail(this.commissionId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.handleCommissionDetail(res.data);
      });
  }

  private handleCommissionDetail(data: ICommission): void {
    data.startDate = this.datePipe.transform(data.startDate, DateFormatEnum.YEAR_DATE_FORMAT);
    data.endDate = this.datePipe.transform(data.endDate, DateFormatEnum.YEAR_DATE_FORMAT);

    this.commissionDetail = data;
    this.dataSource = data;
    this.form.patchValue(data);

    data.commissionGradations.forEach(item => {
      const formGroup = this.createCommissionForm();
      formGroup.patchValue(item);
      this.commissionArray.push(formGroup);
    });
  }

  private markFormAsTouched(): void {
    this.form.markAllAsTouched();
    this.commissionControlsArray.forEach(c => c.markAllAsTouched());
  }

  private validatePeriod(): boolean {
    const start = this.form.value.startDate;
    const end = this.form.value.endDate;
    if (start > end) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Начальный период не может быть больше конечной!'
      });
      return false;
    }
    return true;
  }

  private showValidationError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!'
    });
  }

  private handleResponseMessages(res: any): Observable<any> {
    const generalErrors = res.errors?.[''];
    if (Array.isArray(generalErrors) && generalErrors.length) {
      generalErrors.forEach(error =>
        this.messageService.add({ severity: ToastEnum.ERROR, summary: error })
      );
    } else {
      this.messageService.add({
        severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
        summary: res.message
      });
    }

    return of(res).pipe(delay(res.status ? 2000 : 0));
  }

  private handleSubmitResult(res: any): void {
    if (res.status) {
      this.form.reset();
      this.back();
    } else {
      setValidationErrors(this.form, res);
      this.setGradationErrors(res.errors);
    }
  }

  private setGradationErrors(errors: any): void {
    for (const key in errors) {
      if (key.startsWith('commissionGradations')) {
        const [, index, , fieldName] = key.split(/[\[\].\s]/);
        const fieldKey = fieldName[0].toLowerCase() + fieldName.slice(1);
        const field = this.commissionArray.at(+index)?.get(fieldKey);
        if (field) {
          field.setErrors({ serverErrors: errors[key] });
        }
      }
    }
  }

}
