import { Component, inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { AnalyticService } from '@modules/analytics/services/analytic.service';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { takeUntil } from 'rxjs';
import { IAggregate } from '@modules/analytics/interfaces/aggregate.interface';
import { IPaymentStatistics } from '@modules/analytics/interfaces/payment-statistics.interface';
import {
  IAveragePayment,
  IPaymentCount,
  IPaymentPosType,
  IPaymentStatus,
} from '@modules/analytics/interfaces/analytic.interface';
import { ISelect } from '@core/interfaces/select.interface';
import { environment as env } from '@environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PERIOD_ID, TODAY_ID } from '@core/helper';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { PaymentStatusEnum } from '@core/enums/payment-status.enum';
import { AnalyticsFilterComponent } from '@shared/dialogs/analytics-filter/analytics-filter.component';
import { DatePipe, LowerCasePipe, NgClass } from '@angular/common';
import { first } from 'rxjs/operators';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SharedModule } from '@shared/shared.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { NgxPermissionsModule } from "ngx-permissions";

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  responsive: ApexResponsive[];
  labels: any;
};

@Pipe({
  standalone: true,
  name: 'split',
})
export class SplitPipe implements PipeTransform {
  transform(text: any, pattern: string = '.', index: number = 0): string {
    return String(text).split(pattern)[index] || null;
  }
}

@Component({
  standalone: true,
  selector: 'em-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [
    SharedModule,
    NgApexchartsModule,
    AngularSvgIconModule,
    MatProgressBarModule,
    ClickOutsideModule,
    DropdownComponent,
    NgxMaskPipe,
    SplitPipe,
    NgClass,
    LowerCasePipe,
    NgxPermissionsModule,
  ],
  providers: [AnalyticService, DatePipe, provideNgxMask()],
})
export class AnalyticsComponent extends DestroyableComponent implements OnInit {
  chartOptions: Partial<ChartOptions>;
  chartOptions2: Partial<ChartOptions>;
  chartOptionsPaymentPosType: Partial<ChartOptions>;
  dateFilter: ISelect[];
  cardsData: IAggregate;
  paymentStatistics: IPaymentStatistics;
  paymentCount: IPaymentCount;
  paymentAmount: IPaymentCount;
  paymentStatus: IPaymentStatus[];
  paymentPosType: IPaymentPosType;
  averagePayment: IAveragePayment;
  statusCount: number;
  api = `${env.api.companies}/${env.api.dictionary}`;
  dataFilterApi = `${env.api.analytics}/${env.api.dateFilter}`;
  merchantApi = `${env.api.merchants}/${env.api.dictionary}`;
  posesApi = `${env.api.poses}/${env.api.dictionary}`;
  posesTypeApi = `${env.api.analyticsPosType}/${env.api.dictionary}`;
  serviceApi = `${env.api.analytics}/${env.api.services}/${env.api.dictionary}`;
  merchantFilter = {};
  posTypeFilter = {};
  serviceFilter = {};
  selectedMerchant: { name: string; icon: string };
  selectedPos: { name: string; icon: string };
  selectedPosType: { name: string; icon: string };
  dateType: { name: string; icon: string; id?: string };
  selectedServicesType: { name: string; icon: string };
  dateTypeImage: any = ['day.svg', 'day.svg', 'week.svg', 'month.svg', 'year.svg', 'period.svg'];
  queryParams: IFilterParams | any = {};
  dateFlag: boolean;
  todayId = TODAY_ID;
  paymentStatusEnum = PaymentStatusEnum;
  params: Params = {};

  private service = inject(AnalyticService);
  private matDialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private datePipe = inject(DatePipe);

  constructor() {
    super();
    this.setDefault();
  }

  ngOnInit(): void {
    this.initData();
    this.getDateFilter();
    this.getCardsData();
    this.getPaymentStatistics();
    this.getPaymentCount();
    this.getPaymentAmount();
    this.getPaymentStatus();
    this.getPaymentPosType();
    this.getAveragePayment();
  }

  initData(): void {
    this.route.queryParams.pipe(first(), takeUntil(this.destroyed$)).subscribe((res: any) => {
      if (Object.keys(res).length !== 0) {
        this.queryParams.companyId = res.companyId;
        this.queryParams.merchantId = res.merchantId;
        this.queryParams.posId = res.posId;
        this.queryParams.posTypeId = res.posTypeId;
        this.queryParams.serviceId = res.serviceId;
        this.queryParams.startDate = res.startDate;
        this.queryParams.endDate = res.endDate;
        if (!res.dateFilterTypeId) {
          this.queryParams.dateFilterTypeId = TODAY_ID;
        } else if (res.dateFilterTypeId === PERIOD_ID) {
          this.queryParams.dateFilterTypeId = res.dateFilterTypeId;
          this.dateFlag = true;
          this.dateType = {
            name:
              this.datePipe.transform(this.queryParams.startDate, 'dd.MM.yyyy') +
              ' - ' +
              this.datePipe.transform(this.queryParams.endDate, 'dd.MM.yyyy'),
            icon: 'week.svg',
            id: PERIOD_ID,
          };
        } else {
          this.queryParams.dateFilterTypeId = res.dateFilterTypeId;
        }
        this.params = res;
        if (this.queryParams.merchantId) {
          const merchantId = { merchantId: this.queryParams.merchantId };
          this.merchantFilter = merchantId;
          this.posTypeFilter = merchantId;
          this.serviceFilter = merchantId;
        }
        if (this.queryParams.serviceId) {
          this.serviceFilter = { serviceId: this.queryParams.serviceId };
          this.serviceFilter = { id: this.queryParams.serviceId };
        }
        this.params = { ...res };
      }
    });
  }

  setDefault(): void {
    this.queryParams = {
      dateFilterTypeId: TODAY_ID,
      merchantId: '',
      posId: '',
      posTypeId: '',
      serviceId: '',
      startDate: '',
      endDate: '',
    };
    this.selectedMerchant = { name: 'Все торговые точки', icon: 'checkmark-double.svg' };
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    this.selectedServicesType = { name: 'Тип операции', icon: 'checkmark-double.svg' };
    this.dateType = { name: 'Сегодня', icon: 'day.svg' };
    this.posTypeFilter = {};
  }

  isResetButtonDisabled(): boolean {
    return (
      (!this.queryParams.merchantId || !this.queryParams.dateFilterTypeId) &&
      this.queryParams.dateFilterTypeId === this.todayId &&
      !this.queryParams.posTypeId &&
      !this.queryParams.serviceTypeId
    );
  }

  isActiveFilter(): boolean {
    return this.queryParams.dateFilterTypeId !== this.todayId
      || !!this.queryParams.merchantId
      || !!this.queryParams.posTypeId;
  }

  resetFilter(): void {
    this.dateFlag = false;
    this.setDefault();
    this.refreshData();
    this.params = {};
    this.clearParams();
  }

  openFilter(): void {
    this.matDialog
      .open(AnalyticsFilterComponent, {
        panelClass: 'mobile-dialog',
        data: {
          queryParams: this.queryParams,
          dataFilterApi: this.dataFilterApi,
          merchantApi: this.merchantApi,
          posesTypeApi: this.posesTypeApi,
          posesApi: this.posesApi,
          servicesApi: this.serviceApi,
          dateType: this.dateType,
          selectedMerchant: this.selectedMerchant,
          selectedPos: this.selectedPos,
          selectedPosType: this.selectedPosType,
          selectedServicesType: this.selectedServicesType,
          merchantFilter: this.merchantFilter,
          posTypeFilter: this.posTypeFilter,
          servicesFilter: this.serviceFilter,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.dateFilterTypeId) {
          this.params = res;
          if (res.dateFilterTypeId === PERIOD_ID) {
            this.queryParamCheck('startDate', res.startDate);
            this.queryParamCheck('endDate', res.endDate);
          }
          this.queryParamCheck('dateFilterTypeId', res.dateFilterTypeId);
          this.queryParamCheck('merchantId', res.merchantId);
          this.queryParamCheck('posId', res.posId);
          this.queryParamCheck('posTypeId', res.posTypeId);
          this.queryParamCheck('serviceId', res.serviceId);
          this.refreshData();
          this.clearParams();
        }
      });
  }

  chart1(): void {
    this.chartOptions = {
      series: [
        {
          name: '',
          data: this.paymentCount?.dashboardData.map(item => Number(item.value)),
          color: '#97D35D',
        },
      ],
      chart: {
        height: 260,
        type: 'bar',
        events: {},
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '8px',
          borderRadius: 8,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: true,
        borderColor: '#EDEDFA',
      },
      xaxis: {
        categories: this.paymentCount?.dashboardData.map(item => item.key),
        labels: {
          rotate: 0,
          style: {
            colors: '#8E9AAF',
            fontSize: '14px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8E9AAF',
            fontSize: '14px',
          },
        },
      },
    };
  }

  chart2(): void {
    this.chartOptions2 = {
      series: [
        {
          name: '',
          data: this.paymentAmount?.dashboardData.map(item => Number(item.value)),
        },
      ],
      chart: {
        type: 'line',
        height: 260,
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      markers: {
        colors: ['#ff0000'],
        size: 8,
      },
      xaxis: {
        categories: this.paymentAmount?.dashboardData.map(item => item.key),
        labels: {
          rotate: 0,
          style: {
            colors: '#8E9AAF',
            fontSize: '14px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8E9AAF',
            fontSize: '14px',
          },
        },
      },
    };
  }

  chart3(): void {
    this.chartOptionsPaymentPosType = {
      series: this.paymentPosType?.paymentsByPosTypeCount
        .sort(
          (
            a: { count: number; posTypeId: string },
            b: {
              count: number;
              posTypeId: string;
            }
          ) => a.posTypeId.localeCompare(b.posTypeId)
        )
        .map(item => {
          return item.count;
        }),
      tooltip: {
        enabled: true,
        fillSeriesColor: true,
      },
      colors: ['#4E49CE'],
      chart: {
        height: 220,
        type: 'donut',
      },
      labels: this.paymentPosType?.posTypeMarkers
        .sort(
          (
            a: { name: string; posTypeId: string },
            b: {
              name: string;
              posTypeId: string;
            }
          ) => a.posTypeId.localeCompare(b.posTypeId)
        )
        .map(item => {
          return item.name;
        }),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 370,
            },
          },
        },
      ],
    };
  }

  private getDateFilter(): void {
    this.service
      .getFilterDate()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => (this.dateFilter = res.data));
  }

  private getCardsData(): void {
    this.service
      .getAggregationData(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => (this.cardsData = res.data));
  }

  private getPaymentStatistics(): void {
    this.service
      .getPaymentStatistics(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => (this.paymentStatistics = res.data));
  }

  private getPaymentCount(): void {
    this.service
      .getPaymentCount(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentCount = res.data;
          this.chart1();
        }
      });
  }

  private getPaymentAmount(): void {
    this.service
      .getPaymentAmount(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentAmount = res.data;
          this.chart2();
        }
      });
  }

  private getPaymentStatus(): void {
    this.service
      .getPaymentStatus(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentStatus = res.data;
          this.paymentStatusCount();
        }
      });
  }

  private getPaymentPosType(): void {
    this.service
      .getPaymentPosType(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentPosType = res.data;
          this.chart3();
        }
      });
  }

  private getAveragePayment(): void {
    this.service
      .getAveragePayment(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => (this.averagePayment = res.data));
  }

  private paymentStatusCount(): void {
    this.statusCount = 0;
    this.paymentStatus?.forEach(({ count }) => (this.statusCount += count));
  }

  dateChange(dateId: string): void {
    if (dateId === PERIOD_ID) {
      this.matDialog
        .open(SelectPeriodDialogComponent, {
          data: {
            start: this.queryParams.startDate,
            end: this.queryParams.endDate,
            maxSelectDays: 31,
          },
          panelClass: 'date-picker',
          height: 'auto',
        })
        .afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          if (res) {
            this.dateFlag = true;
            this.queryParams.startDate = res.start.format(DateFormatEnum.DATE_TIME_FORMAT);
            this.queryParams.endDate = res.end.format(DateFormatEnum.DATE_TIME_FORMAT);
            this.queryParams.dateFilterTypeId = dateId;
            this.createdParams('startDate', res.start.format(DateFormatEnum.DATE_TIME_FORMAT));
            this.createdParams('endDate', res.end.format(DateFormatEnum.DATE_TIME_FORMAT));
            this.createdParams('dateFilterTypeId', dateId);
            this.refreshData();
            this.dateType = {
              name: res.start.format(DateFormatEnum.DATE_FORMAT) + ' - ' + res.end.format(DateFormatEnum.DATE_FORMAT),
              icon: 'week.svg',
              id: PERIOD_ID,
            };
          } else {
            if (this.queryParams.startDate && this.queryParams.endDate) {
              this.dateType = {
                name:
                  new Date(this.queryParams.startDate).toLocaleDateString() +
                  ' - ' +
                  new Date(this.queryParams.endDate).toLocaleDateString(),
                icon: 'week.svg',
                id: PERIOD_ID,
              };
            }
          }
        });
    } else {
      this.dateFlag = false;
      this.queryParams.startDate = '';
      this.queryParams.endDate = '';
      delete this.params['startDate'];
      delete this.params['endDate'];
      this.queryParams.dateFilterTypeId = dateId;
      this.createdParams('dateFilterTypeId', dateId);
      this.refreshData();
      this.clearParams();
    }
  }

  clearPeriod(): void {
    if (this.queryParams.startDate && this.queryParams.endDate) {
      this.queryParams.dateFilterTypeId = TODAY_ID;
      delete this.queryParams.startDate;
      delete this.queryParams.endDate;
      this.params = { ...this.queryParams };
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: this.params,
          queryParamsHandling: '',
        })
        .then(() => {
          this.dateType = { name: 'Сегодня', icon: 'day.svg' };
          this.refreshData();
        });
    }
  }

  createdParams(paramsName: string, paramValue: string[] | any): void {
    this.params[paramsName] = paramValue;
    this.clearParams();
  }

  merchantChange(merchantId: string): void {
    this.queryParams.merchantId = merchantId;
    this.merchantFilter = { merchantId: merchantId };
    this.posTypeFilter = { merchantId: merchantId };
    this.createdParams('merchantId', merchantId);
    this.refreshData();
    this.clearPos();
  }

  clearMerchant(): void {
    this.queryParams.posId = '';
    this.queryParams.merchantId = '';
    this.queryParams.posTypeId = '';
    this.queryParams.serviceId = '';
    this.selectedMerchant = { name: 'Все торговые точки', icon: 'checkmark-double.svg' };
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    this.selectedServicesType = { name: 'Тип операции', icon: 'checkmark-double.svg' };
    delete this.params['merchantId'];
    delete this.params['posId'];
    delete this.params['posTypeId'];
    delete this.params['serviceId'];
    this.merchantFilter = {};
    this.posTypeFilter = {};
    this.serviceFilter = {};
    this.clearParams();
    this.refreshData();
  }

  posesChange(posId: string): void {
    this.queryParams.posId = posId;
    this.posTypeFilter = { id: posId };
    this.createdParams('posId', posId);
    this.refreshData();
  }

  clearPos(): void {
    this.queryParams.posId = '';
    this.queryParams.posTypeId = '';
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    delete this.params['posId'];
    delete this.params['posTypeId'];
    this.clearParams();
    this.refreshData();
  }

  posesTypeChange(posesTypeId: string): void {
    this.queryParams.posTypeId = posesTypeId;
    this.createdParams('posTypeId', posesTypeId);
    this.refreshData();
  }

  clearPosType(): void {
    this.queryParams.posTypeId = '';
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    delete this.params['posTypeId'];
    this.clearParams();
    this.refreshData();
  }

  clearParams(): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: this.params,
      })
      .catch();
  }

  clearServicesType(): void {
    this.queryParams.serviceId = '';
    this.selectedServicesType = { name: 'Тип операции', icon: 'checkmark-double.svg' };
    delete this.params['serviceId'];
    this.serviceFilter = {};
    this.clearParams();
    this.refreshData();
  }

  servicesTypeChange(serviceId: string): void {
    this.queryParams.serviceId = serviceId;
    this.createdParams('serviceId', serviceId);
    this.refreshData();
  }

  queryParamCheck(paramKey: string, paramValue: string): void {
    if (paramValue) {
      this.createdParams(paramKey, paramValue);
    } else {
      delete this.queryParams[paramKey];
    }
  }

  refreshData(): void {
    this.getAveragePayment();
    this.getPaymentPosType();
    this.getPaymentStatus();
    this.getCardsData();
    this.getPaymentStatistics();
    this.getPaymentCount();
    this.getPaymentAmount();
  }
}
