import { Component, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommissionService } from '@modules/directory/commission/services/commission.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ICommission } from '@modules/directory/commission/interfaces/commission.interface';
import { DatePipe, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { GradationValidator } from '@core/validators/gradation-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { DATE_PATTERN } from '@core/helper';
import { SvgIconComponent } from "angular-svg-icon";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { NgxMaskDirective } from "ngx-mask";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-commission-edit',
  templateUrl: './commission-edit.component.html',
  styleUrls: ['./commission-edit.component.scss'],
  providers: [CommissionService, DatePipe],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    NgxMaskDirective,
    EbLoaderComponent,
    ToastComponent,
    NgxPermissionsModule,
    EmHeaderComponent
  ]
})
export class CommissionEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  commissionDetail: ICommission;
  loading: boolean;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly commissionService = inject(CommissionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);
  private readonly datePipe = inject(DatePipe);
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  commissionId = this.activatedRoute.snapshot.params['id'];
  constructor(
    dialog: MatDialog,
    location: Location,
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
      this.commissionService.getCommissionDetail(this.commissionId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          res.data.startDate = this.datePipe.transform(res.data.startDate, DateFormatEnum.YEAR_DATE_FORMAT);
          res.data.endDate = this.datePipe.transform(res.data.endDate, DateFormatEnum.YEAR_DATE_FORMAT);
          this.commissionDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          res.data.commissionGradations.forEach(item => {
            const formGroup = this.createCommissionForm();
            formGroup.patchValue(item);
            this.commissionArray.push(formGroup);
          });
        });
    } else {
      this.addCommission();
    }
  }

  onSubmit(): void {
    this.form.get('isDefault').setErrors(null);
    this.form.markAllAsTouched();
    this.commissionControlsArray.forEach((c) => c.markAllAsTouched());

    if (this.form.value.startDate > this.form.value.endDate) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Начальный период не может быть больше конечной!'
      });
      return null;
    }
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.commissionService.updateCommission({...this.commissionDetail, ...this.form.value});
    } else {
      $observer = this.commissionService.createCommission(this.form.value);
    }
    $observer
      .pipe(
        mergeMap(res => {
          const generalErrors = res.errors?.[''];
          if (Array.isArray(generalErrors) && generalErrors.length) {
            generalErrors.forEach(error => {
              this.messageService.add({severity: ToastEnum.ERROR, summary: error});
            });
          } else {
            this.messageService.add({
              severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
              summary: res.message
            });
          }

          return of(res).pipe(delay(res.status ? 2000 : 0));
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
          for (const key in res.errors) {
            if (key.startsWith('commissionGradations')) {
              const result = key.split(/[\[\].\s]/);
              const commissionKey = result[3][0].toLowerCase() + result[3].slice(1);
              const index = Number(result[1]);
              const field = this.commissionArray.at(index).get(commissionKey);
              if (res.errors.hasOwnProperty(key) && field) {
                field.setErrors({serverErrors: res.errors[key]});
              }
            }
          }
        }
      });
  }

  deleteCashBack(index: number): void {
    this.commissionArray.removeAt(index);
  }

  addCommission(): void {
    const formGroup = this.createCommissionForm();
    this.commissionArray.push(formGroup);
  }

  onStatusChange(): void {
    this.form.get('isDefault').setErrors(null)
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
      isPercentage: new FormControl(false)
    }, [GradationValidator.IsPercentValidator()]);
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
    this.form = this.fb.group({
      id: [this.commissionId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false],
      isDefault: [false],
      startDate: [null, [Validators.required, Validators.pattern(DATE_PATTERN)]],
      endDate: [null, [Validators.required, Validators.pattern(DATE_PATTERN)]],
      commissionGradations: this.fb.array([], [Validators.required])
    });
  }
}
