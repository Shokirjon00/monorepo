import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ReportService } from '@modules/report/service/report.service';
import { finalize } from 'rxjs';
import { ISelect } from '@core/interfaces/select.interface';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from '@shared/components/toast/toast.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { environment as env } from '@environments/environment';
import { ToastEnum } from '@core/enums/toast-enum';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { FileSaverService } from 'ngx-filesaver';
import { MessageService } from '@core/services/message.service';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { RECONCILIATION_REPORT_ID, SPECIAL_REPORT_ID } from '@core/helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const ReportType = 'dbc7c9e9-2f8a-4aff-8b31-05c32eefb6cf';

@Component({
  standalone: true,
  selector: 'em-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatMomentDateModule,
    ToastModule,
    AngularSvgIconModule,
    ValidatorModule,
    EskhataBankLoaderComponent,
    AutocompleteComponent,
    SimpleSelectListComponent,
  ],
  providers: [ReportService],
})
export class ReportComponent implements OnInit {
  form: FormGroup;
  loading: boolean;
  reportDictionary: ISelect[];
  dateType = { name: 'Выбрать период' };
  merchantApi = `${env.api.merchants}/${env.api.dictionary}`;
  queryParams: IFilterParams | any = { page: 1 };
  submitted: boolean = false;
  reportType = ReportType;

  private readonly service = inject(ReportService);
  private readonly matDialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getReportDictionary();
    this.validationField();
  }

  dateChange(): void {
    this.matDialog
      .open(SelectPeriodDialogComponent, {
        data: {
          start: this.queryParams.startedAt,
          end: this.queryParams.finishedAt,
          maxSelectDays: 30 * 3,
        },
        panelClass: 'date-picker',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          const startDate = res.start;
          const endDate = res.end;
          const dayDiff = endDate.diff(startDate, 'days');
          if (dayDiff <= 31) {
            this.queryParams.startedAt = startDate.format('yyyy-MM-DD hh:mm:ss');
            this.queryParams.finishedAt = endDate.format('yyyy-MM-DD hh:mm:ss');
            this.form.get('startDate').setValue(startDate.format('yyyy-MM-DD hh:mm:ss'));
            this.form.get('endDate').setValue(endDate.format('yyyy-MM-DD hh:mm:ss'));
            this.dateType = { name: startDate.format('DD.MM.yyyy') + ' - ' + endDate.format('DD.MM.yyyy') };
          } else {
            this.messageService.add({
              severity: ToastEnum.ERROR,
              summary: 'Вы можете выбрать период не более 31 дня.',
            });
          }
        } else if (this.queryParams.startedAt && this.queryParams.finishedAt) {
          this.dateType = {
            name:
              new Date(this.queryParams.startedAt).toLocaleDateString() +
              ' - ' +
              new Date(this.queryParams.finishedAt).toLocaleDateString(),
          };
        }
      });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.submitted = true;
    this.service
      .generateReport(this.form.value)
      .pipe(
        finalize(() => (this.submitted = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          if (res.headers.get('content-disposition')) {
            let fileName = res.headers.get('content-disposition').split(';')[1].split('=')[1];
            this.fileSaverService.save(res.body, fileName);
          } else {
            this.messageService.add({
              severity: ToastEnum.ERROR,
              summary: 'Не удается скачать файл',
              detail: 'Обратитесь к администратору',
            });
          }
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  resetForm(): void {
    this.form.reset();
    this.dateType = { name: 'Выбрать период' };
    delete this.queryParams.startedAt;
    delete this.queryParams.finishedAt;
  }

  private getReportDictionary(): void {
    this.loading = true;
    this.service
      .getReportDictionary()
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => (this.reportDictionary = res.data));
  }

  private creatForm(): void {
    this.form = this.fb.group({
      reportId: ['', [Validators.required]],
      merchantId: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
  }

  private validationField(): void {
    this.f['reportId']?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(reportId => {
      if (reportId === SPECIAL_REPORT_ID || reportId === RECONCILIATION_REPORT_ID) {
        this.f['merchantId'].clearValidators();
      } else {
        this.f['merchantId'].setValidators([Validators.required]);
      }
      this.f['merchantId'].updateValueAndValidity();
    });
  }
}
