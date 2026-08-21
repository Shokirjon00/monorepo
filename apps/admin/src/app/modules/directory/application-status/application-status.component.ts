import {AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild} from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { CityService } from '@modules/directory/city/services/city.service';
import { ICity } from '@modules/directory/city/interfaces/city.interface';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { CityConstants } from "@modules/directory/city/city.constants";
import {ApplicationStatusService} from "@modules/directory/application-status/services/application-status.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
  IMerchantApplicationStatus
} from "@modules/directory/application-status/interfaces/application-status.interface";
import {ApplicationStatusConstants} from "@modules/directory/application-status/application-status.constants";

@Component({
  standalone: true,
  selector: 'em-application-status',
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent],
  providers: [CityService]
})

export class ApplicationStatusComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  merchantApplicationList: IMerchantApplicationStatus[];
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  columns = ApplicationStatusConstants.APPLICATION_STATUS_COLUMNS;
  tableActions: IRowAction[] = ApplicationStatusConstants.TABLE_ACTIONS;
  captionKey = 'city';
  actions: IAction[] = ApplicationStatusConstants.APPLICATION_STATUS_ACTIONS
  paginate: IPaginate;
  params: Params = {}

  private router = inject(Router);
  private service = inject(ApplicationStatusService);
  private route = inject(ActivatedRoute);
  protected destroyRef = inject(DestroyRef);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getCities(params);
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
    this.table().render(this.columns, this.merchantApplicationList)
  }

  detail(applicationStatusId: string): void {
    this.router.navigate(['directory/application-status/info', applicationStatusId]).catch()
  }

  edit(applicationStatusId: string): void {
    this.router.navigate(['directory/application-status/edit', applicationStatusId]).catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCities()
  }

  private getCities(params = this.filterParams): void {
    this.loading = true
    this.service.getMerchantApplicationStatus(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.merchantApplicationList = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
