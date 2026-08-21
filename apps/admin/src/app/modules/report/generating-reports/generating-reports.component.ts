import { Component, inject, OnInit } from '@angular/core';
import { finalize, of, takeUntil } from 'rxjs';
import { ISelect } from '@eskhata/util';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmHeaderComponent, SimpleSelectListComponent, ToastComponent, ToastModule, ValidatorComponent } from '@eskhata/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { IFilterParams } from '@eskhata/util';
import { ToastEnum } from '@eskhata/util';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { MessageService } from '@eskhata/data-access';
import { DestroyableComponent } from '@eskhata/util';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { GeneratingReportsService } from "@modules/report/generating-reports/service/generating-reports.service";
import { ITab } from '@eskhata/util';
import { GeneratingReportsConstants } from "@modules/report/generating-reports/generating-reports.constants";
import { DateFormatEnum } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";

@Component({
  standalone: true,
  selector: 'em-report',
  templateUrl: './generating-reports.component.html',
  styleUrls: ['./generating-reports.component.scss'],
  imports: [
    ReactiveFormsModule,
    ToastModule,
    EmHeaderComponent,
    SimpleSelectListComponent,
    ValidatorComponent,
    SvgIconComponent,
    EbLoaderComponent,
    ToastComponent
  ],
  providers: [GeneratingReportsService]
})
export class GeneratingReportsComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  loading: boolean;
  reportDictionary: ISelect[];
  tabMenuItems: ITab[] = GeneratingReportsConstants.HEADER_TABS;
  dateType: { name: string };
  queryParams: IFilterParams | any = {page: 1};
  submitted: boolean = false;

  private readonly service = inject(GeneratingReportsService);
  private readonly matDialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  constructor() {
    super();
    this.dateType = {name: 'Выбрать период'};
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getReportDictionary()
  }

  dateChange(): void {
    this.matDialog.open(SelectPeriodDialogComponent, {
      data: {
        start: this.queryParams.startedAt,
        end: this.queryParams.finishedAt,
        maxSelectDays: 30 * 3
      },
      panelClass: 'date-picker'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.queryParams.startedAt = res.start.format(DateFormatEnum.DATE_TIME_FORMAT);
          this.queryParams.finishedAt = res.end.format(DateFormatEnum.DATE_TIME_FORMAT);
          this.form.get('startAt').setValue(res.start.format(DateFormatEnum.DATE_TIME_FORMAT));
          this.form.get('endAt').setValue(res.end.format(DateFormatEnum.DATE_TIME_FORMAT));
          this.dateType = {name: res.start.format(DateFormatEnum.DATE_FORMAT) + ' - ' + res.end.format(DateFormatEnum.DATE_FORMAT)};
        } else if (this.queryParams.startedAt && this.queryParams.finishedAt) {
          this.dateType = {
            name: new Date(this.queryParams.startedAt).toLocaleDateString() + ' - ' + new Date(this.queryParams.finishedAt).toLocaleDateString(),
          };
        }
      })
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.submitted = true;

    this.service.generateReport(this.form.value)
      .pipe(
        mergeMap(res => {
          const message = res.status ? res.message : this.extractErrorMessage(res.errors);
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: message,
          });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (!res.status) {
          setValidationErrors(this.form, res);
        }
      });
  }

  resetForm(): void {
    this.form.reset();
    this.dateType = {name: 'Выбрать период'};
    delete this.queryParams.startedAt;
    delete this.queryParams.finishedAt;
  }

  private getReportDictionary(): void {
    this.loading = true;
    this.service.getReportDictionary()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$))
      .subscribe(res => this.reportDictionary = res.data)
  }

  private creatForm(): void {
    this.form = this.fb.group({
      adminReportId: ['', [Validators.required]],
      startAt: ['', [Validators.required]],
      endAt: ['', [Validators.required]],
    })
  }

  private extractErrorMessage(errors: any): string {
    if (Array.isArray(errors)) {
      return errors.join(', ');
    } else if (typeof errors === 'object') {
      return Object.values(errors)
        .flat()
        .join(', ');
    } else if (typeof errors === 'string') {
      return errors;
    }
  }
}
