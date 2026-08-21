import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { DestroyableComponent } from '@eskhata/util';
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { HeaderService, MessageService } from "@core/services";
import { MatDialog } from "@angular/material/dialog";
import { combineLatest, takeUntil } from "rxjs";
import { parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ToastEnum } from '@eskhata/util';
import { finalize } from "rxjs/operators";
import { NgxPermissionsService } from "ngx-permissions";
import { PosTerminalService } from "@modules/main-terminal/pos-terminal/services/pos-terminal.service";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";
import { PosTerminalConstants } from "@modules/main-terminal/pos-terminal/pos-terminal.constants";
import { ITab } from '@eskhata/util';
import { PosTerminalsConstants } from "@modules/client/pos-terminal/pos-terminals.constants";

@Component({
  selector: 'em-pos-terminal',
  standalone: true,
  templateUrl: './pos-terminal.component.html',
  styleUrl: './pos-terminal.component.scss',
  imports: [
    EbLoaderComponent,
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent
],
  providers: [PosTerminalService],
})
export class PosTerminalComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  tabMenuItems: ITab[];
  posTerminal: IPosTerminal[];
  columns: any = PosTerminalConstants.POS_TERMINAL_COLUMNS;
  tableActions = PosTerminalConstants.TABLE_ACTIONS
  paginate: IPaginate | any;
  captionKey = 'pos-terminal-cols'
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PosTerminalService);
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);
  private readonly permissionService = inject(NgxPermissionsService);
  private readonly dialog = inject(MatDialog);

  merchantId = this.route.snapshot.parent.parent.params['merchantId'];
  companyId = this.route.snapshot.parent.parent.params['companyId'];

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  constructor(
  ) {
    super()
    this.initTabData();
    this.changePage();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        if (this.merchantId) {
          this.queryParams.filters = `merchantId==${this.merchantId}`;
        }
        if (this.merchantId) {
          this.changePage();
        }
        this.getPosTerminalList(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.posTerminal)
  }

  showDetail(posTerminalId: string): void {
    if (!this.permissionService.getPermission('PosTerminalDetail')) return;
    const queryParams = {merchantId: this.merchantId};
    if (this.companyId) {
      this.router.navigate(['/clients/company/', this.companyId, 'merchant', this.merchantId, 'pos-terminal', posTerminalId, 'info'], {queryParams}).catch();
    } else if (this.merchantId) {
      this.router.navigate(['/clients/merchant', this.merchantId, 'pos-terminal', posTerminalId, 'info'], {queryParams}).catch()
    }
  }

  edit(posTerminalId: string): void {
    this.headerService.setPosId(posTerminalId);
    if (this.companyId) {
      this.router.navigate(['/clients/company', this.companyId, 'merchant', this.merchantId, 'pos-terminal', posTerminalId, 'edit']).catch();
    } else if (this.merchantId) {
      this.router.navigate(['/clients/merchant', this.merchantId, 'pos-terminal', posTerminalId, 'edit']).catch();
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPosTerminalList()
  }

  deletePosTerminal(companyAcquirerId: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Вы действительно хотите удалить Pos-terminal?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.handlePosTerminalDeletion(companyAcquirerId);
        }
      });
  }

  handlePosTerminalDeletion(companyAcquirerId: string): void {
    this.loading.set(true);
    this.service.removePosTerminal(companyAcquirerId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });
        this.getPosTerminalList();
      });
  }

  private getPosTerminalList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getPosTerminal(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.posTerminal = res.data
          this.paginate = res.meta.pagination;
        }
      })
  }

  private changePage(): void {
    this.headerService.getPageChange()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(pageChange => {
        if (pageChange) {
          this.queryParams.page = pageChange.pageNumber;
          this.queryParams.pageSize = pageChange.pageSize
          this.getPosTerminalList()
        }
      });
  }

  private initTabData(): void {
    combineLatest([
      this.headerService.getCompanyId(),
      this.headerService.getMerchantId()
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([companyId, merchantId]) => {
        this.companyId = companyId;
        this.merchantId = merchantId;
        this.getTabItems();
      });
  }

  private getTabItems(): void {
    if (this.companyId) {
      this.tabMenuItems = PosTerminalsConstants.getPosHeaderTabs(this.companyId, this.merchantId)
    } else {
      this.tabMenuItems = PosTerminalsConstants.getPosHeader(this.merchantId);
    }
  }
}
