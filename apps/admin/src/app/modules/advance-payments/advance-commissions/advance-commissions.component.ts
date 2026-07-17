import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { TableComponent } from "@shared/components/table/table.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ICommission } from "@modules/directory/commission/interfaces/commission.interface";
import { AdvancePaymentsPageConstants } from "@modules/advance-payments/advance-payments-page/advance-payments-page.constants";
import { AdvanceCommissionsConstants } from "@modules/advance-payments/advance-commissions/advance-commissions.constants";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize } from "rxjs";
import { parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AdvanceCommissionsService } from "@modules/advance-payments/advance-commissions/services/advance.commissions.service";

@Component({
  selector: 'em-advance-commissions',
  standalone: true,
  imports: [
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    TableComponent,
    ToastComponent
  ],
  templateUrl: './advance-commissions.component.html',
  styleUrl: './advance-commissions.component.scss'
})
export class AdvanceCommissionsComponent implements OnInit, AfterViewInit{
  readonly table = viewChild(TableComponent);
  commissions: ICommission[];
  loading = signal(false);
  tabMenuItems = AdvancePaymentsPageConstants.HEADER_TABS;
  columns = AdvanceCommissionsConstants.ADVANCE_COMMISSIONS_COLUMNS;
  tableActions = AdvanceCommissionsConstants.TABLE_ACTIONS;
  actions = AdvanceCommissionsConstants.ADVANCE_COMMISSION_ACTIONS;
  paginate: IPaginate;
  captionKey = 'advance_commission';
  params: Params = {};

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(AdvanceCommissionsService);
  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe( takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getCommissions(params);
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
    this.table().render(this.columns, this.commissions)
  }

  showDetail(commissionId: string): void {
    this.router.navigate(['advance/advance-commissions//info', commissionId])
      .catch()
  }

  edit(commissionId: string): void {
    this.router.navigate(['advance/advance-commissions/edit', commissionId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCommissions()
  }

  private getCommissions(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getCommissions(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.commissions = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
