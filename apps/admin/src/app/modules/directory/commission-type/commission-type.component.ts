import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, WritableSignal, viewChild } from '@angular/core';
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util'
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { CommissionTypeConstants } from "@modules/directory/commission-type/commission-type.constants";
import { CommissionTypeService } from "@modules/directory/commission-type/services/commission-type.service";
import { IComissionType } from "@modules/directory/commission-type/interfaces/commission-type.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-device-type',
  templateUrl: './commission-type.component.html',
  styleUrls: ['./commission-type.component.scss'],
  providers: [CommissionTypeService],
  imports: [TableComponent, EMPaginationComponent, EmHeaderComponent]
})
export class CommissionTypeComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  commissionTypes: IComissionType[];
  columns = CommissionTypeConstants.COMMISSION_TYPE_COLUMNS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS;
  captionKey = 'commission-types';
  paginate: IPaginate;
  params: Params = {};
  readonly loading: WritableSignal<boolean> = signal(false);
  private readonly route = inject(ActivatedRoute);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  private readonly router = inject(Router);
  private readonly service = inject(CommissionTypeService);
  protected readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getCommissionTypes(params);
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
    } as ICaption))
    this.table().render(this.columns, this.commissionTypes);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCommissionTypes();
  }

  private getCommissionTypes(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getCommissionList(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.commissionTypes = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
