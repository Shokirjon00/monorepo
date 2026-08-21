import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from "@angular/core";
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { DestroyableComponent } from '@eskhata/util';
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params } from "@angular/router";
import { takeUntil } from "rxjs";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { finalize } from "rxjs/operators";
import { ITab } from '@eskhata/util';
import { MobileAppConstants } from "@modules/main-terminal/mobile-app/mobile-app.constants";
import { PosTerminalService } from "@modules/main-terminal/pos-terminal/services/pos-terminal.service";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";
import { PosTerminalConstants } from "@modules/main-terminal/pos-terminal/pos-terminal.constants";

@Component({
  standalone: true,
  selector: 'em-mobile-app',
  templateUrl: './mobile-app.component.html',
  styleUrls: ['./mobile-app.component.scss'],
  imports: [
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent
  ],
  providers: [PosTerminalService],
})
export class MobileAppComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  mobileApp: IPosTerminal[];
  columns: any = MobileAppConstants.MOBILE_APP_COLUMNS;
  tabMenuItems: ITab[] = PosTerminalConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'mobile-app-key'
  params: Params = {};

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PosTerminalService);
  private queryParams: IFilterParams = {
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
    this.table().render(this.columns, this.mobileApp);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getMobileAppList();
  }

  private getMobileAppList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getMobile(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.mobileApp = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getMobileAppList(params);
        }
      });
  }
}
