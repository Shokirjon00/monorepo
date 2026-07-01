import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, viewChild} from '@angular/core';
import moment, {Moment} from 'moment';
import {DateRange, MatDatepickerModule, MatMonthView} from '@angular/material/datepicker';
import {BehaviorSubject} from 'rxjs';
import {ToastEnum} from '@eskhata/util';
import {MessageService} from '@core/services/message.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {ToastComponent} from '@shared/components/toast/toast.component';
import {MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateFormatEnum} from '@core/enums/date-format.enum';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import 'moment/locale/ru';


@Component({
  standalone: true,
  selector: 'em-select-period-dialog',
  templateUrl: './select-period-dialog.component.html',
  styleUrls: ['./select-period-dialog.component.scss'],
  imports: [
    MatDatepickerModule,
    AngularSvgIconModule,
    ToastComponent,
    MatMomentDateModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_LOCALE, useValue: 'ru' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['l', 'LL'],
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ]
})
export class SelectPeriodDialogComponent implements AfterViewInit, OnInit {
  readonly currentDate = viewChild<MatMonthView<Date>>('currentDate');
  readonly nextDate = viewChild<MatMonthView<Date>>('nextDate');
  showStartDate = {month: {name: ''}, year: ''};
  showEndDate = {month: {name: ''}, year: ''};
  month = [
    {id: '1', name: 'Январь'},
    {id: '2', name: 'Февраль'},
    {id: '3', name: 'Март'},
    {id: '4', name: 'Апрель'},
    {id: '5', name: 'Май'},
    {id: '6', name: 'Июнь'},
    {id: '7', name: 'Июль'},
    {id: '8', name: 'Август'},
    {id: '9', name: 'Сентябрь'},
    {id: '10', name: 'Октябрь'},
    {id: '11', name: 'Ноябрь'},
    {id: '12', name: 'Декабрь'},
  ];
  readonly maxDate = moment().endOf('day');
  readonly dateFilter = (date: Moment | null): boolean => !date || this._dateAdapter.compareDate(date, this.maxDate) <= 0;
  range = {
    start: moment().subtract(1, DateFormatEnum.MONTH_FORMAT),
    end: moment(),
  };
  dateRange = new DateRange(this.range.start, this.range.end);
  currentMonthSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    moment().startOf(DateFormatEnum.MONTH).subtract(1, DateFormatEnum.MONTH)
  );
  currentMonth = this.currentMonthSubject.asObservable();

  get currentActiveDate(): Moment { return this.currentMonthSubject.getValue(); }
  get nextActiveDate(): Moment { return this.nextMonthSubject.getValue(); }
  get canGoNext(): boolean { return this.nextMonthSubject.getValue().clone().isBefore(moment().startOf(DateFormatEnum.MONTH), 'month'); }

  nextMonthSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    moment().startOf(DateFormatEnum.MONTH)
  );
  nextMonth = this.nextMonthSubject.asObservable();
  private _startDate: any;
  private _endDate: any;

  constructor(
    private _dateAdapter: DateAdapter<Moment>,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<SelectPeriodDialogComponent>
  ) {
    if (this.data.start && this.data.end) {
      this.range.start = moment(this.data.start);
      this.range.end = moment(this.data.end);
      this.dateRange = new DateRange(this.range.start, this.range.end);
      if (moment(this.data.start).month() === moment(this.data.end).month()) {
        this.currentMonthSubject.next(moment(this.data.start).startOf(DateFormatEnum.MONTH));
        this.nextMonthSubject.next(moment(this.data.start).startOf(DateFormatEnum.MONTH).add(1, DateFormatEnum.MONTH));
      } else {
        this.currentMonthSubject.next(moment(this.data.start).startOf(DateFormatEnum.MONTH));
        this.nextMonthSubject.next(moment(this.data.end).startOf(DateFormatEnum.MONTH));
      }
    }
  }

  ngOnInit(): void {
    this.setMonth();
  }

  ngAfterViewInit(): void {
    this.setPreviousMonth();
    this.setNextMonth();
    this.cdr.detectChanges();
  }

  setNextMonth(): void {
    if (!this.canGoNext) return;
    const next = this.nextDate().activeDate = this.nextMonthSubject.getValue().add(1, DateFormatEnum.MONTH);
    const prev = this.currentDate().activeDate = this.currentMonthSubject.getValue().add(1, DateFormatEnum.MONTH);
    this.showStartDate.month = Object.assign({}, ...this.month.filter(item => item.id === prev.format(DateFormatEnum.MONTH_FORMAT)));
    this.showEndDate.month = Object.assign({}, ...this.month.filter(item => item.id === next.format(DateFormatEnum.MONTH_FORMAT)));
    this.showStartDate.year = prev.format(DateFormatEnum.YEAR_FORMAT);
    this.showEndDate.year = next.format(DateFormatEnum.YEAR_FORMAT);
  }

  setPreviousMonth(): void {
    const next = this.nextDate().activeDate = this.nextMonthSubject.getValue().subtract(1, DateFormatEnum.MONTH);
    const prev = this.currentDate().activeDate = this.currentMonthSubject.getValue().subtract(1, DateFormatEnum.MONTH);
    this.showStartDate.month = Object.assign({}, ...this.month.filter(item => item.id === prev.format(DateFormatEnum.MONTH_FORMAT)));
    this.showEndDate.month = Object.assign({}, ...this.month.filter(item => item.id === next.format(DateFormatEnum.MONTH_FORMAT)));
    this.showStartDate.year = prev.format(DateFormatEnum.YEAR_FORMAT);
    this.showEndDate.year = next.format(DateFormatEnum.YEAR_FORMAT);
  }

  selectedChange(date: Moment): void {
    if (this._dateAdapter.compareDate(date, this.maxDate) > 0) return;
    if (!this._startDate) {
      this._startDate = date;
    } else if (!this._endDate && this._dateAdapter.compareDate(date, this._startDate) >= 0) {
      this._endDate = date;
    } else {
      this._startDate = date;
      this._endDate = null;
    }
    this.dateRange = new DateRange(this._startDate, this._endDate);
  }

  confirm(): void {
    if (!this.dateRange.end) {
      return this.messageService.add({severity: ToastEnum.ERROR, summary: 'Выберите второй диапазон даты'});
    }
    const analyticsDays = this.dateRange.end.diff(this.dateRange.start, 'days');
    if (this.data.maxSelectDays && analyticsDays > this.data.maxSelectDays) {
      const title = `Выбран неправильный период запроса. Можно запросить информацию не  более ${this.data.maxSelectDays} дня.`;
      this.messageService.add({severity: ToastEnum.ERROR, summary: title});
      return;
    }
    this.matDialogRef.close(this.dateRange);
  }

  close(): void {
    this.matDialogRef.close();
  }

  private setMonth(): void {
    this.showStartDate.month = Object.assign({}, ...this.month.filter(item => item.id === this.range.start.format(DateFormatEnum.MONTH_FORMAT)));
    this.showEndDate.month = Object.assign({}, ...this.month.filter(item => item.id === this.range.end.format(DateFormatEnum.MONTH_FORMAT)));
    this.showStartDate.year = this.range.start.format(DateFormatEnum.YEAR_FORMAT);
    this.showEndDate.year = this.range.end.format(DateFormatEnum.YEAR_FORMAT);
  }

}
