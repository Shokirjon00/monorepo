import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ITab } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { ICaption, IFilterParams, IPaginate, IRowAction } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { DepartmentCodeConstants } from "@modules/directory/departament-code/department-code.constants";
import { IDepartmentCode } from "@modules/directory/departament-code/interfaces/department-code";
import { DepartmentCode } from "@modules/directory/departament-code/services/department-code";

@Component({
  selector: 'em-departament-code',
  imports: [
    EmHeaderComponent,
    ActionsComponent,
    EMPaginationComponent,
    TableComponent
  ],
  templateUrl: './department-code.component.html',
  styleUrl: './department-code.component.scss',
  providers: [DepartmentCode]
})
export class DepartmentCodeComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  departmentCodes: IDepartmentCode[];
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  actions = DepartmentCodeConstants.DEPARTMENT_CODE_ACTIONS;
  columns = DepartmentCodeConstants.DEPARTMENT_CODE_COLUMNS;
  tableActions: IRowAction[] = DepartmentCodeConstants.TABLE_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'department-code-key';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private service = inject(DepartmentCode)
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
    } as ICaption))
    this.table().render(this.columns, this.departmentCodes)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAppealList()
  }

  edit(categoryId: string): void {
    this.router.navigate(['directory/department-code/edit', categoryId])
      .catch()
  }

  private getAppealList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getDepartmentCode(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.departmentCodes = res.data
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
          this.getAppealList(params);
        }
      });
  }

}
