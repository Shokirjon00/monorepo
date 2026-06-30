import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BranchService } from '@modules/directory/branch/services/branch.service';
import { finalize, takeUntil } from 'rxjs';
import { IBranch } from '@modules/directory/branch/interfaces/branch.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
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
