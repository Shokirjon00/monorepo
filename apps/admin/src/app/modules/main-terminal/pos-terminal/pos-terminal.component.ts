import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from "@angular/core";
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { DestroyableComponent } from '@eskhata/util';
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { MessageService } from "@core/services";
import { MatDialog } from "@angular/material/dialog";
import { takeUntil } from "rxjs";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ToastEnum } from '@eskhata/util';
import { finalize } from "rxjs/operators";
import { ITab } from '@eskhata/util';
import { PosTerminalConstants } from "@modules/main-terminal/pos-terminal/pos-terminal.constants";
import { PosTerminalService } from "@modules/main-terminal/pos-terminal/services/pos-terminal.service";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";
import { NgxPermissionsService } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-pos-terminal',
  templateUrl: './pos-terminal.component.html',
  styleUrls: ['./pos-terminal.component.scss'],
  imports: [
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent
  ],
  providers: [PosTerminalService],
})
export class PosTerminalComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  posTerminal: IPosTerminal[];
  columns = PosTerminalConstants.POS_TERMINAL_COLUMNS;
  tableActions = PosTerminalConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = PosTerminalConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'pos-terminal-cols'
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PosTerminalService);
  private readonly messageService = inject(MessageService);
  private readonly permissionService = inject(NgxPermissionsService);
  private readonly dialog = inject(MatDialog);
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
    this.table().render(this.columns, this.posTerminal)
  }

  showDetail(posTerminalId: string): void {
    if (!this.permissionService.getPermission('PosTerminalDetail')) return;
    this.router.navigate(['/main-terminal/pos-terminal', posTerminalId, 'info']).catch()
  }

  edit(posTerminalId: string): void {
    this.router.navigate(['/main-terminal/pos-terminal', posTerminalId, 'edit']).catch()
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPosTerminalList()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.posTerminal.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.loading.set(false)
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

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getPosTerminalList(params);
        }
      });
  }

}
