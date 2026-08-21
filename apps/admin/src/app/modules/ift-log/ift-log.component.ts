import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { ICaption } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { setDefaultFilterValue } from '@eskhata/util';
import { IIftLog } from '@modules/ift-log/interfaces/ift-log.interface';
import { IftLogService } from '@modules/ift-log/services/ift-log.service';
import { IFTLogConstants } from "@modules/ift-log/ift-log.constants";
import { isEmptyObject } from "@core/utils";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-ift-log',
  templateUrl: './ift-log.component.html',
  styleUrls: ['./ift-log.component.scss'],
  providers: [IftLogService],
  imports: [
    TableComponent,
    EmHeaderComponent,
    EMPaginationComponent,
    EbLoaderComponent
  ]
})
export class IftLogComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false)
  iftLogs: IIftLog[];
  paginate: IPaginate | any;
  columns = IFTLogConstants.IFTLOG_COLUMNS;
  captionKey = 'ift-log';
  params: Params = {};
  private readonly service = inject(IftLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
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
    } as ICaption));
    this.table().render(this.columns, this.iftLogs);
  }

  showDetail(iftLogId: string): void {
    this.router.navigate(['ift-log', iftLogId])
      .catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getIftLogs()
  }


  private getIftLogs(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getIftLogs(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.iftLogs = res.data;
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
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getIftLogs(params);
        }
      });
  }
}
