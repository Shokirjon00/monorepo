import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { CommissionService } from '@modules/directory/commission/services/commission.service';
import { ICommission } from '@modules/directory/commission/interfaces/commission.interface';
import { IHeader, ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { CommissionConstants } from "@modules/directory/commission/commission.constants";

@Component({
  standalone: true,
  selector: 'em-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss'],
  providers: [CommissionService],
  imports: [TableComponent, ToastComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class CommissionComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  commissions: ICommission[];
  loading: boolean;
  columns = CommissionConstants.COMMISSION_COLUMNS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = CommissionConstants.TABLE_ACTIONS;
  captionKey = 'commission';
  headerData: IHeader = {
    isFilter: true,
    tabShow: true
  };
  actions: IAction[] = CommissionConstants.COMMISSION_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(CommissionService);
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
    this.router.navigate(['directory/commission/detail/info', commissionId])
      .catch()
  }

  edit(commissionId: string): void {
    this.router.navigate(['directory/commission/detail/edit', commissionId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCommissions()
  }

  private getCommissions(params = this.filterParams): void {
    this.loading = true;
    this.service.getCommissions(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.commissions = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

}
