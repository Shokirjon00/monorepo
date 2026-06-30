import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from "@shared/components/table/table.component";
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { ICaption, IRowAction } from "@core/interfaces/table.interface";
import { IPaginate } from "@core/interfaces/paginate.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ITab } from "@core/interfaces/header.interface";
import { IFilterParams } from "@core/interfaces/filter-params.interface";
import { IGateways } from "@modules/setting-container/gateways/interfaces/gateways";
import { GatewaysService } from "@modules/setting-container/gateways/services/gateways.service";
import { finalize, takeUntil } from "rxjs";
import { setDefaultFilterValue } from "@core/utils/route-param-parse";
import { parseFilterParams } from "@core/utils/filter-util";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { GatewaysConstants } from "@modules/setting-container/gateways/gateways.constants";

@Component({
  standalone: true,
  selector: 'em-gateways',
  templateUrl: './gateways.component.html',
  styleUrls: ['./gateways.component.scss'],
  providers: [GatewaysService],
  imports: [
    TableComponent,
    EMPaginationComponent,
    EbLoaderComponent,
    EmHeaderComponent
  ]
})
export class GatewaysComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  gateways: IGateways[];
  columns: any = GatewaysConstants.GATEWAYS_COLUMNS;
  tableActions: IRowAction[] = GatewaysConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = GatewaysConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'setting';
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly gatewayService = inject(GatewaysService);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getGateways(params);
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
    this.table().render(this.columns, this.gateways);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getGateways();
  }

  edit(id: string): void {
    this.router.navigate(['/setting/gateways/edit', id]).catch();
  }

  private getGateways(params = this.filterParams): void {
    this.loading.set(true);
    this.gatewayService.getGateways(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.gateways = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
