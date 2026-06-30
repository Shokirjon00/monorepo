import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { TableComponent } from '@shared/components/table/table.component';
import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { ITab } from '@core/interfaces/header.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { PaymentPurposesService } from "@modules/directory/payment-purposes/services/payment-purposes.service";
import { IPaymentPurpose } from "@modules/directory/payment-purposes/interfaces/payment-purposes.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { PaymentPurposesConstants } from "@modules/directory/payment-purposes/payment-purposes.constants";

@Component({
  standalone: true,
  selector: 'em-payment-purposes',
  templateUrl: './payment-purposes.component.html',
  styleUrls: ['./payment-purposes.component.scss'],
  providers: [PaymentPurposesService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent ]
})
export class PaymentPurposesComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);

  paymentPurposes: IPaymentPurpose[];
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  loading: boolean;
  captionKey = 'payment-purposes';
  columns = PaymentPurposesConstants.DESTINATION_TEMPLATE_COLUMNS;
  tableActions: IRowAction[] = PaymentPurposesConstants.TABLE_ACTIONS
  actions: IAction[] = PaymentPurposesConstants.PAYMENT_PURPOSES_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(PaymentPurposesService);
  private readonly route = inject(ActivatedRoute);
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
        this.getPaymentPurposes(params);
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
    this.table().render(this.columns, this.paymentPurposes)
  }

  edit(purposesId: string): void {
    this.router.navigate(['/directory/payment-purposes/edit', purposesId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getPaymentPurposes()
  }

  private getPaymentPurposes(params = this.filterParams): void {
    this.loading = true;
    this.service.getPaymentPurposes(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.paymentPurposes = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
