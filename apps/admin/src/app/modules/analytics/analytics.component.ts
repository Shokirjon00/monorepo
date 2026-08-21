import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AnalyticService } from '@modules/analytics/services/analytic.service';
import {
  ChartOptions,
  IAggregate,
  IAveragePayment,
  IPaymentCount,
  IPaymentPosType,
  IPaymentStatistics,
  IPaymentStatus
} from '@modules/analytics/interfaces';
import { ISelect } from '@eskhata/util';
import { environment as env } from '@environments/environment';
import { CompanyService } from '@modules/client/company/services/company.service';
import { MatDialog } from '@angular/material/dialog';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { isPhone, PERIOD_ID, TODAY_ID } from '@core/helper';
import { PaymentStatusEnum, TabType } from '@core/enums/payment-status.enum';
import { IFilterParams } from '@eskhata/util';
import { CommonModule, DatePipe } from '@angular/common';
import { DateFormatEnum } from '@eskhata/util';
import { SharedModule } from "@shared/shared.module";
import { NgApexchartsModule } from "ng-apexcharts";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { ClickOutsideModule } from '@eskhata/util';
import { DropdownComponent, ToastComponent } from '@eskhata/ui';
import { NgxMaskPipe } from "ngx-mask";
import { SplitPipe } from "@modules/analytics/pipes/split.pipe";
import { NgxPermissionsModule } from "ngx-permissions";
import { AnalyticsFilterComponent } from "@shared/dialogs/analytics-filter/analytics-filter.component";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AnalyticsTabsBarComponent } from "@modules/analytics/analytics-container/analytics-tabs-bar/analytics-tabs-bar.component";
import { ANALYTICS_TABS } from "./analytics.constants";

@Component({
  standalone: true,
  selector: 'em-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    NgApexchartsModule,
    AngularSvgIconModule,
    MatProgressBarModule,
    ClickOutsideModule,
    ToastComponent,
    NgxMaskPipe,
    NgxPermissionsModule,
    DropdownComponent,
    SplitPipe,
    FormsModule,
    AnalyticsTabsBarComponent
  ],
  providers: [
    AnalyticService,
    CompanyService,
    DatePipe
  ]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  readonly analyticsTabs = ANALYTICS_TABS;

  chartOptionsPaymentCount: Partial<ChartOptions>;
  chartOptionsPaymentAmount: Partial<ChartOptions>;
  chartOptionsPaymentPosType: Partial<ChartOptions>;
  dateFilter: ISelect[];
  cardsData: IAggregate;
  paymentStatistics: IPaymentStatistics;
  paymentCount: { [key: string]: IPaymentCount } = {};
  selectedTab?: TabType = TabType.All;
  paymentAmount: IPaymentCount;
  paymentStatus: IPaymentStatus[];
  paymentPosType: IPaymentPosType;
  averagePayment: IAveragePayment;
  companies: ISelect[];
  statusCount: number;
  api = `${env.api.companies}/${env.api.dictionary}`;
  dataFilterApi = `${env.api.analytics}/${env.api.dateFilter}`;
  merchantApi = `${env.api.merchants}/${env.api.dictionary}`;
  posesApi = `${env.api.poses}/${env.api.dictionary}`;
  posesTypeApi = `${env.api.analytics}/${env.api.posType}/${env.api.dictionary}`;
  servicesApi = `${env.api.analytics}/${env.api.services}/${env.api.dictionary}`;
  companySegmentApi = `${env.api.analytics}/${env.api.companySegment}/${env.api.dictionary}`;
  companyFilter = {};
  merchantFilter = {};
  posFilter = {};
  posTypeFilter = {};
  servicesFilter = {};
  segmentFilter = {};
  selectedCompany: { name: string, icon?: string };
  selectedMerchant: { name: string, icon: string };
  selectedPos: { name: string, icon: string };
  selectedPosType: { name: string, icon: string };
  selectedServicesType: { name: string, icon: string };
  selectedSegmentType: { name: string, icon: string };
  dateType: { name: string, icon: string, id?: string };
  dateTypeImage: any = ['day.svg', 'day.svg', 'week.svg', 'month.svg', 'year.svg', 'period.svg'];
  params: Params = {};
  queryParams: IFilterParams | any = {};
  dateFlag: boolean;
  todayId = TODAY_ID;
  paymentStatusEnum = PaymentStatusEnum;
  isMobile = isPhone();
  isOpen = false;

  private readonly service = inject(AnalyticService);
  private readonly companyService = inject(CompanyService);
  private readonly matDialog = inject(MatDialog);
  private readonly datePipe = inject(DatePipe);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.setDefault();
    this.initData();
    this.getDateFilter();
    this.getCardsData();
    this.getPaymentStatistics();
    this.getPaymentCount(this.selectedTab);
    this.getPaymentAmount(this.selectedTab);
    this.getPaymentStatus();
    this.getPaymentPosType();
    this.getAveragePayment();
    this.getCompanyDictionaries();
  }

  ngAfterViewInit(): void {
    this.chartPaymentPosType();
  }

  isResetButtonDisabled(): boolean {
    return (!this.queryParams.companyId || !this.queryParams.dateFilterTypeId) &&
      this.queryParams.dateFilterTypeId === this.todayId &&
      !this.queryParams.posTypeId &&
      !this.queryParams.serviceId &&
      !this.queryParams.companySegmentId;
  }

  resetFilter(): void {
    this.dateFlag = false;
    this.setDefault();
    this.refreshData();
    this.params = {};
    this.clearParams();
  }

  companyChange(companyId: string): void {
    this.queryParams.companyId = companyId;
    this.companyFilter = {companyId: companyId};
    this.posTypeFilter = {companyId: companyId};
    this.createdParams('companyId', companyId);
    this.refreshData();
    this.clearMerchant();
  }

  clearCompany(): void {
    delete this.queryParams['companyId'];
    this.selectedCompany = {name: 'Все организации', icon: 'company.svg'};
    delete this.params['companyId'];
    this.clearPosType();
    this.clearMerchant();
  }

  dateChange(dateId: string): void {
    if (dateId === PERIOD_ID) {
      this.matDialog.open(SelectPeriodDialogComponent, {
        data: {
          start: this.queryParams.startDate,
          end: this.queryParams.endDate,
          maxSelectDays: 31
        },
        panelClass: 'date-picker',
        height: '460px',
      })
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
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
                name: new Date(this.queryParams.startDate).toLocaleDateString() + ' - ' + new Date(this.queryParams.endDate).toLocaleDateString(),
                icon: 'week.svg',
                id: PERIOD_ID,
              };
            }
          }
        })
    } else {
      this.dateFlag = false;
      this.queryParams.startDate = '';
      this.queryParams.endDate = '';
      delete this.queryParams.startDate;
      delete this.queryParams.endDate;
      this.queryParams.dateFilterTypeId = dateId;
      this.createdParams('dateFilterTypeId', dateId);
      this.refreshData();
      this.clearParams();
    }
  }

  options: { value: TabType; label: string }[] = [
    {value: TabType.All, label: 'Всего транзакций'},
    {value: TabType.Incoming, label: 'Входящие'},
    {value: TabType.Outgoing, label: 'Исходящие'}
  ];

  selectTab(tab: TabType): void {
    this.selectedTab = tab;
    this.loadData(tab);
    this.refreshData();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  getSelectedOptionLabel(): string {
    const selected = this.options.find(opt => opt.value === this.selectedTab);
    return selected ? selected.label : '';
  }

  clearPeriod(): void {
    if (this.queryParams.startDate && this.queryParams.endDate) {
      this.queryParams.dateFilterTypeId = TODAY_ID;
      delete this.queryParams.startDate;
      delete this.queryParams.endDate;
      this.dateType = {name: 'Сегодня', icon: 'day.svg'};
      this.clearParams();
      this.refreshData();
    }
  }

  merchantChange(merchantId: string): void {
    this.queryParams.merchantId = merchantId;
    this.merchantFilter = {merchantId: merchantId};
    this.posTypeFilter = {merchantId: merchantId};
    this.createdParams('merchantId', merchantId);
    this.refreshData();
    this.clearPos()
  }

  clearMerchant(): void {
    delete this.queryParams['posId'];
    delete this.queryParams['posTypeId'];
    delete this.queryParams['merchantId'];
    delete this.queryParams['serviceId'];
    delete this.queryParams['companySegmentId'];
    this.selectedMerchant = {name: 'Все торговые точки', icon: 'checkmark-double.svg',};
    this.selectedPos = {name: 'Все кассы', icon: 'checkmark-double.svg',};
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg',};
    this.selectedServicesType = {name: 'Тип операции', icon: 'checkmark-double.svg',};
    this.selectedSegmentType = {name: 'Сегмент', icon: 'checkmark-double.svg'};
    delete this.params['merchantId'];
    delete this.params['posId'];
    delete this.params['posTypeId'];
    delete this.params['serviceId'];
    delete this.params['companySegmentId'];
    this.clearParams();
    this.refreshData();
  }

  posesChange(posId: string): void {
    this.queryParams.posId = posId;
    this.posFilter = {posId: posId};
    this.posTypeFilter = {id: posId};
    this.createdParams('posId', posId);
    this.refreshData();
  }

  clearPos(): void {
    this.queryParams.posId = '';
    this.selectedPos = {name: 'Все кассы', icon: 'checkmark-double.svg',};
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
    delete this.queryParams['posTypeId'];
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg'};
    delete this.params['posTypeId'];
    this.posTypeFilter = {};
    this.clearParams();
    this.refreshData();
  }

  clearServicesType(): void {
    this.queryParams.serviceId = '';
    this.selectedServicesType = {name: 'Тип операции', icon: 'checkmark-double.svg'};
    delete this.params['serviceId'];
    this.posTypeFilter = {};
    this.clearParams();
    this.refreshData();
  }

  clearSegmentType(): void {
    this.queryParams.companySegmentId = '';
    this.selectedSegmentType = {name: 'Сегмент', icon: 'checkmark-double.svg'};
    delete this.params['companySegmentId'];
    this.posTypeFilter = {};
    this.clearParams();
    this.refreshData();
  }

  servicesTypeChange(serviceId: string): void {
    this.queryParams.serviceId = serviceId;
    this.createdParams('serviceId', serviceId);
    this.refreshData();
  }

  segmentTypeChange(companySegmentId: string): void {
    this.queryParams.companySegmentId = companySegmentId;
    this.createdParams('companySegmentId', companySegmentId);
    this.refreshData();
  }

  private initData(): void {
    this.activatedRoute.queryParams
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        if (Object.keys(res).length !== 0) {
          this.queryParams.companyId = res.companyId;
          this.queryParams.merchantId = res.merchantId;
          this.queryParams.posId = res.posId;
          this.queryParams.posTypeId = res.posTypeId;
          this.queryParams.serviceId = res.serviceId;
          this.queryParams.companySegmentId = res.companySegmentId;
          this.queryParams.startDate = res.startDate;
          this.queryParams.endDate = res.endDate;
          if (!res.dateFilterTypeId) {
            this.queryParams.dateFilterTypeId = TODAY_ID;
          } else if (res.dateFilterTypeId === PERIOD_ID) {
            this.queryParams.dateFilterTypeId = res.dateFilterTypeId;
            this.dateFlag = true;
            this.dateType = {
              name: this.datePipe.transform(this.queryParams.startDate, DateFormatEnum.FULL_DATE_FORMAT) + ' - ' + this.datePipe.transform(this.queryParams.endDate, DateFormatEnum.FULL_DATE_FORMAT),
              icon: 'week.svg',
              id: PERIOD_ID,
            };
          } else {
            this.queryParams.dateFilterTypeId = res.dateFilterTypeId;
          }
          this.params = res;
          if (this.queryParams.companyId) {
            const companyId = {companyId: this.queryParams.companyId};
            this.companyFilter = companyId;
            this.posTypeFilter = companyId;
            this.loadSelectedCompany(this.queryParams.companyId);
          }
          if (this.queryParams.merchantId) {
            const merchantId = {merchantId: this.queryParams.merchantId};
            this.merchantFilter = merchantId;
            this.posTypeFilter = merchantId;
          }
          if (this.queryParams.posId) {
            this.posFilter = {posId: this.queryParams.posId};
            this.posTypeFilter = {id: this.queryParams.posId};
          }
          this.params = {...res};
        }
      });
  }

  private loadSelectedCompany(companyId: string): void {
    this.companyService.getCompanyById(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.selectedCompany = res.data;
        this.cdr.markForCheck();
      });
  }

  private getDateFilter(): void {
    this.service.getFilterDate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.dateFilter = res.data;
        this.setDateTypeLabel();
        this.cdr.markForCheck();
      })
  }

  private setDateTypeLabel(): void {
    const id = this.queryParams.dateFilterTypeId;
    if (!id || id === PERIOD_ID || this.dateFlag) return;
    const index = this.dateFilter?.findIndex(item => item.id === id) ?? -1;
    if (index < 0) return;
    this.dateType = {
      name: this.dateFilter[index].name,
      icon: this.dateTypeImage[index] || 'day.svg',
    };
  }

  private getCardsData(): void {
    this.service.getAggregationData(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.cardsData = res.data;
        this.cdr.markForCheck();
      })
  }

  private getPaymentStatistics(): void {
    this.service.getPaymentStatistics(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.paymentStatistics = res.data;
        this.cdr.markForCheck();
      })
  }

  private loadData(tab: TabType): void {
    this.getPaymentCount(tab);
    this.getPaymentAmount(tab);
  }

  private getPaymentCount(tab: TabType): void {
    this.service.getPaymentCount(tab, this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.paymentCount[tab] = res.data;
          this.chartPaymentCount(tab);
          this.cdr.markForCheck();
        }
      });
  }

  private getPaymentAmount(tab: TabType): void {
    this.service.getPaymentAmount(tab, this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.paymentAmount = res.data;
          this.chartPaymentAmount();
          this.cdr.markForCheck();
        }
      });
  }

  private getPaymentStatus(): void {
    this.service.getPaymentStatus(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.paymentStatus = res.data;
          this.paymentStatusCount();
          this.cdr.markForCheck();
        }
      })
  }

  private getPaymentPosType(): void {
    this.service.getPaymentPosType(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.paymentPosType = res.data;
          this.chartPaymentPosType();
        }
      })
  }

  private getAveragePayment(): void {
    this.service.getAveragePayment(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.averagePayment = res.data;
        this.cdr.markForCheck();
      })
  }

  private getCompanyDictionaries(): void {
    this.companyService.getCompanyDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.companies = res.data;
        this.cdr.markForCheck();
      })
  }

  private paymentStatusCount(): void {
    this.statusCount = 0;
    this.paymentStatus?.forEach(({count}) => this.statusCount += count)
  }

  private refreshData(): void {
    this.getAveragePayment();
    this.getPaymentPosType();
    this.getPaymentStatus();
    this.getCardsData();
    this.getPaymentStatistics();
    this.getPaymentCount(this.selectedTab);
    this.getPaymentAmount(this.selectedTab);
  }

  private setDefault(): void {
    this.queryParams = {
      dateFilterTypeId: TODAY_ID,
      companyId: '',
      merchantId: '',
      posId: '',
      posTypeId: '',
      serviceId: '',
      companySegmentId: '',
      startDate: '',
      endDate: '',
    };
    this.selectedCompany = {name: 'Все организации', icon: 'company.svg',};
    this.selectedMerchant = {name: 'Все торговые точки', icon: 'checkmark-double.svg',};
    this.selectedPos = {name: 'Все кассы', icon: 'checkmark-double.svg',};
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg',};
    this.selectedServicesType = {name: 'Тип операции', icon: 'checkmark-double.svg',};
    this.selectedSegmentType = {name: 'Сегмент', icon: 'checkmark-double.svg',};
    this.dateType = {name: 'Сегодня', icon: 'day.svg',};
    this.companyFilter = {};
    this.merchantFilter = {};
    this.posFilter = {};
    this.posTypeFilter = {};
  }

  private chartPaymentCount(tab: 'all' | 'incoming' | 'outgoing'): void {
    const data = this.paymentCount[tab]?.dashboardData || [];
    if (!this.chartOptionsPaymentCount) {
      this.chartOptionsPaymentCount = {};
    }
    this.chartOptionsPaymentCount[tab] = {
      series: [
        {
          name: '',
          data: data.map((item: any) => Number(item.value)),
          color: '#97D35D'
        }
      ],
      chart: {
        height: 260,
        type: 'bar',
        events: {},
        toolbar: {show: false}
      },
      plotOptions: {
        bar: {
          columnWidth: "8px",
          borderRadius: 8
        }
      },
      dataLabels: {enabled: false},
      legend: {show: false},
      grid: {show: true, borderColor: '#EDEDFA'},
      xaxis: {
        categories: data.map(item => item.key),
        labels: {
          rotate: 0,
          style: {
            colors: '#8E9AAF',
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8E9AAF',
            fontSize: '14px'
          }
        }
      }
    };
  }

  private chartPaymentAmount(): void {
    this.chartOptionsPaymentAmount = {
      series: [
        {
          name: '',
          data: this.paymentAmount?.dashboardData.map(item => {
            return Number(item.value)
          }),
        }
      ],
      chart: {
        type: 'line',
        height: 260,
        zoom: {
          enabled: false
        },
        animations: {
          enabled: true
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      markers: {
        colors: ['#ff0000'],
        size: 8,
      },
      xaxis: {
        categories: this.paymentAmount?.dashboardData.map(item => {
          return item.key
        }),
        labels: {
          rotate: 0,
          style: {
            colors: '#8E9AAF',
            fontSize: '14px',
          },
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8E9AAF',
            fontSize: '14px',
          }
        }
      },
    };
  }

  private chartPaymentPosType(): void {
    if (!this.paymentPosType?.paymentsByPosTypeCount?.length) {
      this.chartOptionsPaymentPosType = null;
      return;
    }

    this.chartOptionsPaymentPosType = {
      series: this.chart(),
      labels: this.getLabels(),
      chart: {
        height: 220,
        type: 'donut'
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: true
      },
      colors: ['#4E49CE'],
    };

    this.cdr.detectChanges();
  }

  private chart(): number[] {
    return (
      this.paymentPosType?.paymentsByPosTypeCount
        ?.sort((a, b) => a.posTypeId.localeCompare(b.posTypeId))
        ?.map((item) => item.count) ?? []
    );
  }

  private getLabels(): string[] {
    return (
      this.paymentPosType?.posTypeMarkers
        ?.sort((a, b) => a.posTypeId.localeCompare(b.posTypeId))
        ?.map((item) => item.name) ?? []
    );
  }

  private createdParams(paramsName: string, paramValue: string): void {
    this.params[paramsName] = paramValue;
    this.clearParams();
  }

  private clearParams(): void {
    this.router.navigate([],
      {
        relativeTo: this.activatedRoute,
        queryParams: this.queryParams,
      })
      .catch();
  }

  openFilter(): void {
    this.matDialog.open(AnalyticsFilterComponent, {
      panelClass: 'mobile-dialog',
      data: {
        queryParams: this.queryParams,
        dataFilterApi: this.dataFilterApi,
        merchantApi: this.merchantApi,
        posesTypeApi: this.posesTypeApi,
        servicesApi: this.servicesApi,
        companySegmentApi: this.companySegmentApi,
        posesApi: this.posesApi,
        dateType: this.dateType,
        selectedMerchant: this.selectedMerchant,
        selectedPos: this.selectedPos,
        selectedPosType: this.selectedPosType,
        selectedServicesType: this.selectedServicesType,
        selectedSegmentType: this.selectedSegmentType,
        merchantFilter: this.merchantFilter,
        posTypeFilter: this.posTypeFilter,
      }
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
          this.queryParamCheck('companySegmentId', res.companySegmentId);
          this.refreshData();
          this.clearParams();
        }
      });
  }

  queryParamCheck(paramKey: string, paramValue: string): void {
    if (paramValue) {
      this.createdParams(paramKey, paramValue);
    } else {
      delete this.queryParams[paramKey];
    }
  }

  protected readonly TabType = TabType;
}

