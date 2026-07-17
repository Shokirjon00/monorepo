import {AfterViewInit, Component, inject, OnInit, signal, viewChild} from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption } from '@core/interfaces/table.interface';
import { IPaginate } from '@eskhata/util';
import { ActivatedRoute, Params } from '@angular/router';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { finalize, takeUntil } from 'rxjs';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { parseFilterParams } from '@core/utils/filter-util';
import { ITab } from '@core/interfaces/header.interface';
import { isEmptyObject } from "@core/utils";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ExportQueueConstants } from "@modules/report/export-queue/export-queue.constants";
import { ExportQueueService } from "@modules/report/export-queue/services/export-queue.service";
import { IExportQueueData } from "@modules/report/export-queue/interfaces/export-queue-data";

@Component({
  standalone: true,
  selector: 'em-export-queue',
  templateUrl: './export-queue.component.html',
  styleUrls: ['./export-queue.component.scss'],
  imports: [
    TableComponent,
    EmHeaderComponent,
    EMPaginationComponent,
    EbLoaderComponent
  ],
  providers: [ExportQueueService]
})
export class ExportQueueComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  exportQueueData: IExportQueueData[];
  captions = ExportQueueConstants.EXPORT_QUEUE_COLUMNS;
  tabMenuItems: ITab[] = ExportQueueConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'export-queue';
  params: Params = {};
  fileStorageUrl: string;
  fileStorageToken: string;

  private service = inject(ExportQueueService);
  private route = inject(ActivatedRoute);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.captions, this.exportQueueData);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getAdminExports();
  }

  private getAdminExports(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getAdminExports(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.exportQueueData = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.captions);
          this.getAdminExports(params);
        }
      });
  }
}
