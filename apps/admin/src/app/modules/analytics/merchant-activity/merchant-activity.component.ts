import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    HostBinding,
    inject,
    input,
    signal,
    untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Params } from '@angular/router';
import { environment as env } from '@environments/environment';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { QrPosPanelComponent } from '@modules/analytics/qr-pos-analytics/components/qr-pos-panel/qr-pos-panel.component';
import { QrPosChartComponent } from '@modules/analytics/qr-pos-analytics/components/qr-pos-chart/qr-pos-chart.component';
import { QrPosCardsComponent } from '@modules/analytics/qr-pos-analytics/components/qr-pos-cards/qr-pos-cards.component';
import {
    QrPosPlanFactComponent
} from '@modules/analytics/qr-pos-analytics/components/qr-pos-plan-fact/qr-pos-plan-fact.component';
import {
    IQrPosAcquiringStructure,
    IQrPosChartData,
    IQrPosMetricCard,
} from '@modules/analytics/qr-pos-analytics/interfaces/qr-pos-analytics.interface';
import { MaTableComponent, MaRow } from './components/ma-table/ma-table.component';
import { MaQuickActionsComponent } from './components/ma-quick-actions/ma-quick-actions.component';
import { MaForecastSummaryComponent } from './components/ma-forecast-summary/ma-forecast-summary.component';
import { MerchantActivityFilterService } from './services/merchant-activity-filter.service';
import { MerchantActivityService } from './services/merchant-activity.service';
import { DashboardLoaderService } from '@modules/analytics/services/dashboard-loader.service';
import {
    IErrorItem,
    IMetricCard,
    IPlanFactForecast,
    IQuickAction,
    IRankItem,
    ITimeSeries,
    ITurnoverForecast
} from './interfaces/merchant-activity.interface';
import {
    MA_ERROR_COLUMNS,
    MA_MERCHANTS_TOP_COLUMNS,
    MA_NO_TX_COLUMNS,
    MA_QUICK_ACTIONS,
    MA_TOP_COLUMNS,
} from './merchant-activity.constants';

@Component({
    standalone: true,
    selector: 'em-merchant-activity',
    templateUrl: './merchant-activity.component.html',
    styleUrls: ['./merchant-activity.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MerchantActivityFilterService, MerchantActivityService, DashboardLoaderService],
    imports: [
        CommonModule,
        DropdownComponent,
        ToastComponent,
        QrPosPanelComponent,
        QrPosChartComponent,
        QrPosCardsComponent,
        QrPosPlanFactComponent,
        MaTableComponent,
        MaQuickActionsComponent,
        MaForecastSummaryComponent,
    ],
})
export class MerchantActivityComponent {
    readonly embedded = input<boolean>(false);
    readonly externalParams = input<Params>({});

    @HostBinding('class.ma-embedded') get isEmbedded(): boolean {
        return this.embedded();
    }

    private readonly filterService = inject(MerchantActivityFilterService);
    private readonly service = inject(MerchantActivityService);
    private readonly loader = inject(DashboardLoaderService);

    readonly filter = this.filterService.filter;
    readonly loading = this.loader.loading;
    readonly ready = signal(false);

    readonly dateApi = `${env.api.analytics}/${env.api.dateFilter}`;

    private readonly merchantsCardsData = signal<IMetricCard[]>([]);
    private readonly merchantsDynamicsData = signal<ITimeSeries | null>(null);
    private readonly merchantsPlanFactData = signal<IPlanFactForecast | null>(null);
    private readonly merchantsTopData = signal<IRankItem[]>([]);
    private readonly merchantsNoTxData = signal<IRankItem[]>([]);
    private readonly posCardsData = signal<IMetricCard[]>([]);
    private readonly posTopData = signal<IRankItem[]>([]);
    private readonly posErrorsData = signal<IErrorItem[]>([]);
    private readonly qrCardsData = signal<IMetricCard[]>([]);
    private readonly qrTopData = signal<IRankItem[]>([]);
    private readonly qrErrorsData = signal<IErrorItem[]>([]);
    readonly forecast = signal<ITurnoverForecast | null>(null);

    readonly merchantCards = computed<IQrPosMetricCard[]>(() => this.toCards(this.merchantsCardsData()));
    readonly posCards = computed<IQrPosMetricCard[]>(() => this.toCards(this.posCardsData()));
    readonly qrCards = computed<IQrPosMetricCard[]>(() => this.toCards(this.qrCardsData()));

    readonly merchantsDynamicsChart = computed<IQrPosChartData | null>(() => {
        const d = this.merchantsDynamicsData();
        if (!d) return null;
        return {
            type: 'line',
            categories: d.categories,
            series: [
                {name: 'Факт', data: d.fact, color: '#61BE40'},
                {name: 'Прошлый период', data: d.plan ?? [], color: '#2C7BE3', dashed: true},
            ],
        };
    });

    readonly merchantsPlanFact = computed(() => {
        const p = this.merchantsPlanFactData();
        return p ? {fact: p.fact, plan: p.plan, forecast: p.forecast, currency: p.unit} : null;
    });

    readonly forecastChart = computed<IQrPosChartData | null>(() => {
        const f = this.forecast()?.series;
        if (!f) return null;
        return {
            type: 'line',
            categories: f.categories,
            series: [
                {name: 'Факт', data: f.fact, color: '#61BE40'},
                {name: 'Прогноз', data: f.forecast ?? [], color: '#A148C0', dashed: true},
            ],
        };
    });

    readonly posTopStructure = computed<IQrPosAcquiringStructure | null>(() => this.toStructure(this.posTopData()));
    readonly qrTopStructure = computed<IQrPosAcquiringStructure | null>(() => this.toStructure(this.qrTopData()));

    readonly noMerchantCards = computed(() => !this.merchantCards().length);
    readonly noMerchantsTop = computed(() => !this.merchantsTopRows().length);
    readonly noNoTx = computed(() => !this.noTxRows().length);
    readonly noPosCards = computed(() => !this.posCards().length);
    readonly noQrCards = computed(() => !this.qrCards().length);
    readonly noPosTop = computed(() => !this.posTopStructure()?.items?.length);
    readonly noQrTop = computed(() => !this.qrTopStructure()?.items?.length);
    readonly noPosErrors = computed(() => !this.posErrorRows().length);
    readonly noQrErrors = computed(() => !this.qrErrorRows().length);
    readonly noForecast = computed(() => !this.forecastChart()?.series?.some(s => s.data.some(v => v != null && v !== 0)));

    readonly merchantsTopRows = computed<MaRow[]>(() => this.rankRows(this.merchantsTopData()));
    readonly noTxRows = computed<MaRow[]>(() =>
    this.merchantsNoTxData().map(r => ({rank: r.rank, name: r.name, value: r.value})));
    readonly posErrorRows = computed<MaRow[]>(() => this.errorRows(this.posErrorsData()));
    readonly qrErrorRows = computed<MaRow[]>(() => this.errorRows(this.qrErrorsData()));

    readonly merchantsTopColumns = MA_MERCHANTS_TOP_COLUMNS;
    readonly noTxColumns = MA_NO_TX_COLUMNS;
    readonly errorColumns = MA_ERROR_COLUMNS;
    readonly topColumns = MA_TOP_COLUMNS;

    readonly posTopRows = computed<MaRow[]>(() => this.topRows(this.posTopStructure()));
    readonly qrTopRows = computed<MaRow[]>(() => this.topRows(this.qrTopStructure()));

    readonly quickActions = MA_QUICK_ACTIONS;

    private readonly autoReload = effect(() => {
        this.externalParams();
        untracked(() => this.reload());
    });

    refresh(): void {
        this.reload();
    }

    onDateChange(dateFilterTypeId: string): void {
        this.filterService.patch({dateFilterTypeId});
        this.reload();
    }

    onQuickAction(action: IQuickAction): void {
        void action;
    }

    private reload(): void {
        const params = {...this.filterService.params(), ...this.externalParams()};
        this.ready.set(true);

        const group = params['serviceGroup'];
        const wantPos = group !== 'qr';
        const wantQr = group !== 'pos';

        this.loader.load(this.service.getMerchantsCards(params), v => this.merchantsCardsData.set(v));
        this.loader.load(this.service.getMerchantsDynamics(params), v => this.merchantsDynamicsData.set(v));
        this.loader.load(this.service.getMerchantsPlanFact(params), v => this.merchantsPlanFactData.set(v));
        this.loader.load(this.service.getMerchantsTop(params), v => this.merchantsTopData.set(v));
        this.loader.load(this.service.getMerchantsNoTx(params), v => this.merchantsNoTxData.set(v));
        this.loader.load(this.service.getForecast(params), v => this.forecast.set(v));

        if (wantPos) {
            this.loader.load(this.service.getParkCards({...params, serviceGroup: 'pos'}, 'POS'), v => this.posCardsData.set(v));
            this.loader.load(this.service.getParkTop({...params, serviceGroup: 'pos'}), v => this.posTopData.set(v));
            this.posErrorsData.set(this.service.errors());
        } else {
            this.posCardsData.set([]);
            this.posTopData.set([]);
            this.posErrorsData.set([]);
        }

        if (wantQr) {
            this.loader.load(this.service.getParkCards({...params, serviceGroup: 'qr' }, 'QR'), v => this.qrCardsData.set(v));
            this.loader.load(this.service.getParkTop({...params, serviceGroup: 'qr'}), v => this.qrTopData.set(v));
            this.qrErrorsData.set(this.service.errors());
        } else {
            this.qrCardsData.set([]);
            this.qrTopData.set([]);
            this.qrErrorsData.set([]);
        }
    }

    private rankRows(items: IRankItem[] | undefined): MaRow[] {
        return (items ?? []).map(r => ({rank: r.rank, name: r.name, value: r.value, secondary: r.secondary}));
    }

    private topRows(structure: IQrPosAcquiringStructure | null): MaRow[] {
        return (structure?.items ?? []).map((it, i) => ({
            rank: i + 1,
            name: it.label,
            value: it.value,
            percent: it.percent,
        }));
    }

    private errorRows(errors: IErrorItem[]): MaRow[] {
        return errors.map(e => ({code: e.code, description: e.description, count: e.count}));
    }

    private toCards(cards: IMetricCard[] | undefined): IQrPosMetricCard[] {
        return (cards ?? []).map(c => ({
            key: c.key,
            title: c.title,
            value: c.value,
            unit: c.unit,
            deltaPercent: c.deltaPercent,
            comparisonValue: c.comparisonValue,
            comparisonUnit: c.comparisonUnit,
            growthIsPositive: c.growthIsPositive,
            gauge: c.gauge,
        }));
    }

    private toStructure(items: IRankItem[] | undefined): IQrPosAcquiringStructure | null {
        if (!items?.length) return null;
        return {
            total: items.reduce((s, i) => s + i.value, 0),
            items: items.map(i => ({
                key: String(i.rank),
                label: i.name,
                value: i.value,
                percent: i.percent ?? 0,
                color: i.color
            })),
        };
    }
}
