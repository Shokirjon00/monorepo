import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { IResBankEmp } from '@modules/directory/responsible-bank-employees/interfaces/res-bank-emp.interface';
import { ResBankEmpService } from '@modules/directory/responsible-bank-employees/services/res-bank-emp.service';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import {
  ResponsibeBankEmployeesConstants
} from "@modules/directory/responsible-bank-employees/responsibe-bank-employees.constants";

@Component({
  standalone: true,
  selector: 'em-responsible-bank-employees',
  templateUrl: './responsible-bank-employees.component.html',
  styleUrls: ['./responsible-bank-employees.component.scss'],
  providers: [ResBankEmpService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class ResponsibleBankEmployeesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  resEmps: IResBankEmp[];
  columns = ResponsibeBankEmployeesConstants.RESPONSIBE_BANK_COLUMNS;
  tableActions: IRowAction[] = ResponsibeBankEmployeesConstants.TABLE_ACTIONS
  captionKey = 'resBankEmp';
  actions: IAction[] = ResponsibeBankEmployeesConstants.RESPONSIBE_BANK_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ResBankEmpService);

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
        this.getResBankEmps(params);
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
    this.table().render(this.columns, this.resEmps)
  }

  detail(resBankEmployeeId: string): void {
    this.router.navigate(['directory/res-bank-emp/info', resBankEmployeeId])
      .catch()
  }

  edit(resBankEmployeeId: string): void {
    this.router.navigate(['directory/res-bank-emp/edit', resBankEmployeeId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getResBankEmps()
  }

  private getResBankEmps(params = this.filterParams): void {
    this.loading = true;
    this.service.getResBankEmps(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.resEmps = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
