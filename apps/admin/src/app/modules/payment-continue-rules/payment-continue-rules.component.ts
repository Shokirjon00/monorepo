import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { IHeader } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { IPaymentContinueRules } from '@modules/payment-continue-rules/interfaces/payment-continue-rules.interface';
import { PaymentContinueRulesService } from '@modules/payment-continue-rules/services/payment-continue-rules.service';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { PaymentContinueRulesConstants } from '@modules/payment-continue-rules/payment-continue-rules.constants';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';

@Component({
  standalone: true,
  selector: 'em-payment-continue-rules',
  templateUrl: './payment-continue-rules.component.html',
  styleUrls: ['./payment-continue-rules.component.scss'],
  providers: [PaymentContinueRulesService],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EmHeaderComponent,
    EMPaginationComponent
  ]
})
export class PaymentContinueRulesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  paymentRules: IPaymentContinueRules[];
  loading = signal(false);
  columns: any = PaymentContinueRulesConstants.PAYMENT_CONTINUE_RULES_COLUMNS;
  tableActions: IRowAction[] = PaymentContinueRulesConstants.TABLE_ACTIONS
  actions: IAction[] = PaymentContinueRulesConstants.PAYMENTS_CONTINUE_RULES_ACTIONS
  captionKey = 'continue-rules';
  header: IHeader = {
    isFilter: true,
    tabShow: false,
    title: 'Правила продолжения платежа'
  };
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PaymentContinueRulesService);

  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getPaymentRules(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.paymentRules)
  }

  detail(payContinueRulesId: string): void {
    this.router.navigate(['continue-rules', payContinueRulesId, 'info'])
      .catch()
  }

  edit(payContinueRulesId: string): void {
    this.router.navigate(['continue-rules', payContinueRulesId, 'edit'])
      .catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getPaymentRules();
  }

  private getPaymentRules(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getPaymentContinueRules(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.paymentRules = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
