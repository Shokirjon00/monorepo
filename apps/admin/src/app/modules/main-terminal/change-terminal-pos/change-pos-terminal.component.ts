import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from "@angular/core";
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, TableService } from '@eskhata/ui';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { finalize } from "rxjs/operators";
import { ITab } from '@eskhata/util';
import { ChangePosTerminalConstants } from "@modules/main-terminal/change-terminal-pos/change-pos-terminal.constants";
import { ChangePosTerminalService } from "@modules/main-terminal/change-terminal-pos/services/change-pos-terminal.service";
import {
  IChangePosTerminal, IImportExcelResult
} from "@modules/main-terminal/change-terminal-pos/interfaces/change-pos-terminal.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { IAction } from '@eskhata/util';
import { ImportResultDialogComponent } from "@shared/dialogs/import-result-dialog/import-result-dialog.component";
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services";

@Component({
  standalone: true,
  selector: 'em-change-pos-terminal',
  templateUrl: './change-pos-terminal.component.html',
  styleUrls: ['./change-pos-terminal.component.scss'],
  imports: [
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent,
    ActionsComponent
  ],
  providers: [ChangePosTerminalService],
})
export class ChangePosTerminalComponent implements OnInit, AfterViewInit {

  readonly table = viewChild(TableComponent);
  loading = signal(false);
  posTerminal: IChangePosTerminal[];
  columns = ChangePosTerminalConstants.POS_TERMINAL_COLUMNS;
  tableActions = ChangePosTerminalConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = ChangePosTerminalConstants.HEADER_TABS;
  actions = ChangePosTerminalConstants.HEADER_ACTIONS;
  paginate: IPaginate | any;
  captionKey = 'pos-list'
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ChangePosTerminalService);
  private readonly dialog = inject(MatDialog);
  private readonly tableService = inject(TableService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: unknown, i: unknown) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.posTerminal)
  }

  showDetail(posTerminalId: string): void {
    this.router.navigate(['/main-terminal/pos-list', posTerminalId, 'info']).catch();
  }

  edit(posTerminalId: string): void {
    this.router.navigate(['/main-terminal/pos-list', posTerminalId, 'edit']).catch();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getTerminalsList();
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.posTerminal.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  onImportExcel({ file, action }: { file: File; action: IAction }): void {
    if (!action.path) return;

    this.loading.set(true);
    this.tableService.importExcel<IHttpResponse<IImportExcelResult>>(action.path, file)
        .pipe(
            finalize(() => this.loading.set(false)),
            takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (res) => {
            if (res.status && res.data) {
              this.openImportResult(res.data);
              this.getTerminalsList();
            } else {
              this.showErrors(res);
            }
          },
          error: (err) => this.showErrors(err?.error),
        });
  }

  private openImportResult(data: IImportExcelResult): void {
    this.dialog.open(ImportResultDialogComponent, {
      data,
      panelClass: 'custom-modalbox',
      maxWidth: 600,
    });
  }

  private showErrors(res: unknown): void {
    this.extractErrorMessages(res).forEach((msg) => {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: msg });
    });
  }

  private extractErrorMessages(res: unknown): string[] {
    if (res && typeof res === 'object') {
      const { errors, message } = res as { errors?: unknown; message?: unknown };
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat().filter(Boolean) as string[];
        if (messages.length) return messages;
      }
      if (typeof message === 'string' && message) return [message];
    }
    return ['Неизвестная ошибка'];
  }

  private getTerminalsList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getTerminals(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getTerminalsList(params);
        }
      });
  }

}
