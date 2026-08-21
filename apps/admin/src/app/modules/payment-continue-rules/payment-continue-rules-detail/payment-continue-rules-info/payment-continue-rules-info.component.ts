import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { IPaymentContinueRules } from '@modules/payment-continue-rules/interfaces/payment-continue-rules.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaymentContinueRulesService } from '@modules/payment-continue-rules/services/payment-continue-rules.service';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import { ICaption, IRowAction } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import {
  IPaymentContinueRuleAccordance
} from '@modules/payment-continue-rules/interfaces/payment-continue-rule-accordance.interface';
import { IFilterParams } from '@eskhata/util';
import {
  PaymentContinueRuleAccordancesService
} from '@modules/payment-continue-rules/services/payment-continue-rule-accordances.service';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { BreadcrumbService } from 'xng-breadcrumb';
import { CommonModule } from '@angular/common';
import { IHeader } from '@core/interfaces';
import {
  PaymentContinueRulesInfoConstants
} from '@modules/payment-continue-rules/payment-continue-rules-detail/payment-continue-rules-info/payment-continue-rules-info.constants';
import { DateTimePipe } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-payment-continue-rules-info',
  templateUrl: './payment-continue-rules-info.component.html',
  styleUrls: ['./payment-continue-rules-info.component.scss'],
  providers: [
    PaymentContinueRulesService,
    PaymentContinueRuleAccordancesService,
    BreadcrumbService
  ],
  imports: [
    CommonModule,
    ActionsComponent,
    EMPaginationComponent,
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    DateTimePipe,
  ]
})
export class PaymentContinueRulesInfoComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  accordance: IPaymentContinueRuleAccordance[];
  continueDetail: IPaymentContinueRules
  captionKey = 'accordance';
  loading = signal(false);

  captions = PaymentContinueRulesInfoConstants.PAYMENT_CONTINUE_RULES_INFO_COLUMNS;

  tableActions: IRowAction[] = PaymentContinueRulesInfoConstants.TABLE_ACTIONS
  header: IHeader = {
    isFilter: true,
    tabShow: false,
    title: 'Информация'
  };
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(PaymentContinueRulesService);
  private readonly accordanceService = inject(PaymentContinueRuleAccordancesService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  rulesId = this.activatedRoute.snapshot.parent.params['rulesId'];
  actions: IAction[] = PaymentContinueRulesInfoConstants.getActions(this.rulesId)
  filterParams: IFilterParams = {
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.service.getPaymentContinueRuleById(this.rulesId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.continueDetail = res.data;
          this.breadcrumbService.set('@paymentContinueDetail', this.continueDetail.paymentStatusName);
        }
      });

    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams.page = res['page'];
        this.filterParams.pageSize = res['pageSize'];
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.filterParams.page = 1;
        } else {
          this.filterParams.module = this.captionKey;
        }
        this.getAccordances();
        this.router.navigate([],
          {
            relativeTo: this.activatedRoute,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.captions, this.accordance)
  }

  accordanceEdit(id: string): void {
    this.router.navigate(['continue-rules', this.rulesId, 'accordance', 'edit', id])
      .catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getAccordances();
  }

  private getAccordances(): void {
    this.filterParams.filters = `paymentContinueRuleId==${this.rulesId}`;
    this.loading.set(true);
    this.accordanceService.getAccordances(this.filterParams)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.accordance = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
