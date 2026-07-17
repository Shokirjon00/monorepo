import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxMaskPipe } from "ngx-mask";
import { AdvancePaymentsPageConstants } from "@modules/advance-payments/advance-payments-page/advance-payments-page.constants";
import { TableComponent } from "@shared/components/table/table.component";
import { NgClass } from "@angular/common";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize, Subscription } from "rxjs";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AdvancePaymentsService } from "@modules/advance-payments/advance-payments-page/services/advance-payments.service";
import { IAdvancePaymentsPage, IAdvancePayoutsStatusAmounts } from "@modules/advance-payments/advance-payments-page/interfaces/advance-payments-page";

@Component({
  selector: 'em-advance-payments-page',
  standalone: true,
  imports: [
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    NgxMaskPipe,
    NgClass,
    TableComponent
  ],
  templateUrl: './advance-payments-page.component.html',
  styleUrl: './advance-payments-page.component.scss',
})
export class AdvancePaymentsPageComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  advances: IAdvancePaymentsPage[];
  paymentStatusAmounts: IAdvancePayoutsStatusAmounts[];
  tabMenuItems = AdvancePaymentsPageConstants.HEADER_TABS;
  columns = AdvancePaymentsPageConstants.ADVANCE_PAYMENTS_COLUMNS;
  actions = AdvancePaymentsPageConstants.ADVANCE_ACTIONS;
  paginate: IPaginate | any;
  captionKey = 'advance-payments-cols';

  private advancesSub: Subscription;
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(AdvancePaymentsService);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.advances);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAdvanceList();
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.advances.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private getAdvanceList(params = this.queryParams): void {
    this.loading.set(true);
    if (this.advancesSub && !this.advancesSub.closed) {
      this.advancesSub.unsubscribe();
    }
    this.advancesSub = this.service.getAdvance({
      page: params.page,
      pageSize: params.pageSize,
      filters: params.filters,
      sorts: params.sorts ?? ""
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.advances = res.data.advancePayouts;
          this.paymentStatusAmounts = res.data.advancePayoutsStatusAmounts;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getAdvanceList(params);
        }
      });
  }
}
