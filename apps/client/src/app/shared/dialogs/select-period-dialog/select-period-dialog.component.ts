import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import moment, { Moment } from 'moment';
import { DateRange, MatMonthView } from '@angular/material/datepicker';
import { BehaviorSubject } from 'rxjs';
import { DateAdapter } from '@angular/material/core';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import 'moment/locale/ru';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'em-select-period-dialog',
  templateUrl: './select-period-dialog.component.html',
  styleUrls: ['./select-period-dialog.component.scss'],
  imports: [ToastComponent, MatMonthView, SvgIconComponent],
})
export class SelectPeriodDialogComponent implements AfterViewInit, OnInit {
  readonly currentDate = viewChild<MatMonthView<Date>>('currentDate');
  readonly nextDate = viewChild<MatMonthView<Date>>('nextDate');
  showStartDate = { month: { name: '' }, year: '' };
  showEndDate = { month: { name: '' }, year: '' };
  month = [
    { id: '1', name: 'Январь' },
    { id: '2', name: 'Февраль' },
    { id: '3', name: 'Март' },
    { id: '4', name: 'Апрель' },
    { id: '5', name: 'Май' },
    { id: '6', name: 'Июнь' },
    { id: '7', name: 'Июль' },
    { id: '8', name: 'Август' },
    { id: '9', name: 'Сентябрь' },
    { id: '10', name: 'Октябрь' },
    { id: '11', name: 'Ноябрь' },
    { id: '12', name: 'Декабрь' },
  ];
  range = {
    start: moment().subtract(1, 'M'),
    end: moment(),
  };
  dateRange = new DateRange(this.range.start, this.range.end);
  currentMonthSubject: BehaviorSubject<any> = new BehaviorSubject<any>(moment().startOf('month').subtract(1, 'month'));
  currentMonth = this.currentMonthSubject.asObservable();
  nextMonthSubject: BehaviorSubject<any> = new BehaviorSubject<any>(moment().startOf('month'));
  nextMonth = this.nextMonthSubject.asObservable();
  private _startDate: any;
  private _endDate: any;

  private dateAdapter = inject<DateAdapter<Moment>>(DateAdapter);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  readonly data = inject(MAT_DIALOG_DATA);
  private matDialogRef =
    inject<MatDialogRef<SelectPeriodDialogComponent>>(MatDialogRef);

  ngOnInit(): void {
    this.dateAdapter.setLocale('ru');
    if (this.data.start && this.data.end) {
      this.range.start = moment(this.data.start);
      this.range.end = moment(this.data.end);
      this.dateRange = new DateRange(this.range.start, this.range.end);
      const analyticsDays = this.dateRange.end.diff(this.dateRange.start, 'days');
      if (moment(this.data.start).month() === moment(this.data.end).month()) {
        this.currentMonthSubject.next(moment(this.data.start).startOf('month'));
        this.nextMonthSubject.next(moment(this.data.start).startOf('month').add(1, 'month'));
      } else if (analyticsDays > 60) {
        this.currentMonthSubject.next(moment(this.data.start).startOf('month'));
        this.nextMonthSubject.next(moment(this.data.end).startOf('month').add(-1, 'month'));
      } else {
        this.currentMonthSubject.next(moment(this.data.start).startOf('month'));
        this.nextMonthSubject.next(moment(this.data.end).startOf('month'));
      }
    }
    this.setMonth();
  }

  ngAfterViewInit(): void {
    this.setPreviousMonth();
    this.setNextMonth();
    this.cdr.detectChanges();
  }

  setMonth(): void {
    this.showStartDate.month = Object.assign(
      {},
      ...this.month.filter(item => item.id === this.range.start.format('M'))
    );
    this.showEndDate.month = Object.assign({}, ...this.month.filter(item => item.id === this.range.end.format('M')));
    this.showStartDate.year = this.range.start.format('YYYY');
    this.showEndDate.year = this.range.end.format('YYYY');
  }

  setNextMonth(): void {
    const next = (this.nextDate().activeDate = this.nextMonthSubject.getValue().add(1, 'month'));
    const prev = (this.currentDate().activeDate = this.currentMonthSubject.getValue().add(1, 'month'));
    this.showStartDate.month = Object.assign({}, ...this.month.filter(item => item.id === prev.format('M')));
    this.showEndDate.month = Object.assign({}, ...this.month.filter(item => item.id === next.format('M')));
    this.showStartDate.year = prev.format('YYYY');
    this.showEndDate.year = next.format('YYYY');
  }

  setPreviousMonth(): void {
    const next = (this.nextDate().activeDate = this.nextMonthSubject.getValue().subtract(1, 'month'));
    const prev = (this.currentDate().activeDate = this.currentMonthSubject.getValue().subtract(1, 'month'));
    this.showStartDate.month = Object.assign({}, ...this.month.filter(item => item.id === prev.format('M')));
    this.showEndDate.month = Object.assign({}, ...this.month.filter(item => item.id === next.format('M')));
    this.showStartDate.year = prev.format('YYYY');
    this.showEndDate.year = next.format('YYYY');
  }

  selectedChange(date: Moment): void {
    if (!this._startDate) {
      this._startDate = date;
    } else if (!this._endDate && this.dateAdapter.compareDate(date, this._startDate) >= 0) {
      this._endDate = date;
    } else {
      this._startDate = date;
      this._endDate = null;
    }
    this.dateRange = new DateRange(this._startDate, this._endDate);
  }

  confirm(): void {
    if (!this.dateRange.end) {
      return this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Выберите второй диапазон даты' });
    }
    const analyticsDays = this.dateRange.end.diff(this.dateRange.start, 'days');
    if (analyticsDays > this.data.maxSelectDays) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: `Выбран неправильный период запроса. Можно запросить информацию не более ${this.data.maxSelectDays} дня.`,
      });
      return;
    }
    this.matDialogRef.close(this.dateRange);
  }

  close(): void {
    this.matDialogRef.close();
  }
}
