import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { DestroyableComponent } from '@eskhata/util';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BranchService } from '@modules/directory/branch/services/branch.service';
import { finalize, takeUntil } from 'rxjs';
import { IBranch } from '@modules/directory/branch/interfaces/branch.interface';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { BranchConstants } from "@modules/directory/branch/branch.constants";

@Component({
  standalone: true,
  selector: 'em-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  providers: [BranchService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class BranchComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  branches: IBranch[];
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  columns = BranchConstants.BRANCH_COLUMNS;
  tableActions: IRowAction[] = BranchConstants.TABLE_ACTIONS
  captionKey = 'branch';
  actions: IAction[] = BranchConstants.BRANCH_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(BranchService);
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
        this.getBranches(params);
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
    this.table().render(this.columns, this.branches)
  }

  detail(branchId: string): void {
    this.router.navigate(['directory/branch/info', branchId])
      .catch()
  }

  edit(branchId: string): void {
    this.router.navigate(['directory/branch/edit', branchId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getBranches();
  }

  private getBranches(params = this.filterParams): void {
    this.loading = true;
    this.service.getBranches(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.branches = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
