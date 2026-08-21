import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { IFilterParams, IPaginate, IRowAction, ITab } from '@core/interfaces';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HeaderService } from '@eskhata/data-access';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, EskhataBankLoaderComponent, TableComponent } from '@eskhata/ui';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { IUsers } from '@modules/user-container/user/interfaces/users.interface';
import { IAction } from '@eskhata/util';
import { PosTerminalConstants } from '@modules/user-container/pos-terminal/pos-terminal.constants';
import { SharedModule } from '@shared/shared.module';
import { isPhone } from '@core/helper';
import { PosTerminalService } from '@modules/user-container/pos-terminal/services/pos-terminal.service';
import { ICaption } from '@eskhata/util';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';

@Component({
  selector: 'em-pos-terminal',
  standalone: true,
  imports: [
    TableComponent,
    EskhataBankLoaderComponent,
    EMPaginationComponent,
    SharedModule,
    NgxPermissionsModule,
    ActionsComponent,
    EmHeaderComponent,
  ],
  templateUrl: './pos-terminal.component.html',
  styleUrl: './pos-terminal.component.scss',
})
export class PosTerminalComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  posTerminal: IUsers[];
  loading = signal(false);
  columns: ICaption[] = PosTerminalConstants.POS_TERMINAL_COLUMNS;
  tableActions: IRowAction[] = PosTerminalConstants.TABLE_ACTIONS;
  actions: IAction[] = PosTerminalConstants.ACTIONS;
  showScrollButton: boolean = false;
  captionKey = 'posTerminalFiltersForm';
  params: Params = {};
  tabMenuItems: ITab[] = PosTerminalConstants.HEADER_TABS;
  paginate: IPaginate | any;

  readonly isMobile = isPhone();

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private posTerminalService = inject(PosTerminalService);
  private headerService = inject(HeaderService);
  private permissionService = inject(NgxPermissionsService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15,
  };

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
      this.params = res;
      this.queryParams.page = res['page'];
      this.queryParams.pageSize = res['pageSize'];
      const params = parseFilterParams(res, this.queryParams, this.columns);
      if (this.params['module'] && this.captionKey !== this.params['module']) {
        this.queryParams.page = 1;
      } else {
        this.queryParams.module = this.captionKey;
      }
      this.getPosTerminal(params);
    });
  }

  ngAfterViewInit(): void {
    this.columns.map(
      (x: any, i: any) =>
        ({
          key: x,
          index: i,
          isSelected: true,
        }) as ICaption
    );
    this.table().render(this.columns, this.posTerminal);
  }

  showDetail(posTerminalId: string): void {
    if (!this.permissionService.getPermission('PosTerminalUserDetail')) return;
    this.router.navigate(['user/pos-terminal/info', posTerminalId]).catch();
  }

  edit(posTerminalId: string): void {
    this.router.navigate(['user/pos-terminal/edit', posTerminalId]).catch();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPosTerminal();
  }

  private getPosTerminal(params = this.queryParams): void {
    this.loading.set(true);
    this.posTerminalService
      .getPosTerminal(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.posTerminal = res.data;
          this.paginate = res.meta.pagination;
          this.headerService.setPage(this.paginate);
        }
      });
  }
}
