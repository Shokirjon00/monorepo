import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { IFilterParams, IOptionAction, IPaginate, IRowAction } from '@core/interfaces';
import { ICaption } from '@core/interfaces/table1.interface';
import { ShiftHistoryConstants } from '@modules/shift-history/shift-history.constants';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { IAction } from '@shared/components/actions/action.interface';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '@shared/shared.module';
import { IShiftHistory } from '@modules/shift-history/interfaces/shift-history';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { ShiftHistoryService } from '@modules/shift-history/service/shift-history.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { ToastModule } from '@shared/components/toast/toast.module';
import { HttpResponse } from '@angular/common/http';
import { isPhone } from '@core/helper';
import { printFile } from '@core/utils/print-file';
import { FileSaverService } from 'ngx-filesaver';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { isEmptyObject } from '@core/utils/is-empty-object';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShiftHistoryMobileCardComponent } from '@modules/shift-history/shift-history-mobile-card/shift-history-mobile-card.component';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';

@Component({
  selector: 'em-shift-history',
  standalone: true,
  templateUrl: './shift-history.component.html',
  styleUrl: './shift-history.component.scss',
  imports: [
    EmHeaderComponent,
    ActionsComponent,
    EMPaginationComponent,
    EskhataBankLoaderComponent,
    SharedModule,
    TableComponent,
    ToastModule,
    NgxPermissionsModule,
    ShiftHistoryMobileCardComponent,
  ],
  providers: [ShiftHistoryService]
})
export class ShiftHistoryComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  shiftHistories: IShiftHistory[];
  loading = signal(false);
  columns: ICaption[] = ShiftHistoryConstants.SHIFT_HISTORY_COLUMNS;
  actions: IAction[] = ShiftHistoryConstants.ACTIONS;
  optionActions: IOptionAction[] = ShiftHistoryConstants.OPTION_ACTIONS;
  tableActions: IRowAction[] = ShiftHistoryConstants.TABLE_ACTIONS;
  captionKey = 'shiftFiltersForm';
  readonly isMobile = isPhone();
  showScrollButton: boolean = false;
  paginate: IPaginate | any;
  params: Params = {};

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ShiftHistoryService);
  private readonly permissionService = inject(NgxPermissionsService);
  private readonly dialog = inject(MatDialog);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly messageService = inject(MessageService);
  private readonly sanitizer = inject(DomSanitizer);

  private filterParams: IFilterParams = {
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
    } as ICaption));
    this.table().render(this.columns, this.shiftHistories);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getShift();
  }

  openReceiptDialog(shiftId: string): void {
    this.service.getReceiptType().subscribe(response => {
      const receiptTypes = response.data.map(item => ({
        id: item.id,
        name: item.name
      }));

      this.dialog.open(ConfirmDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        data: {
          title: 'Выберите тип чека',
          options: receiptTypes
        }
      }).afterClosed()
        .subscribe(selectedTypeId => {
          if (selectedTypeId) {
            this.getCheckInfo(shiftId, selectedTypeId);
          }
        });
    });
  }

  getCheckInfo(shiftId: string, typeId: string): void {
    this.loading.set(true);
    this.service.getCheck(shiftId, typeId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: HttpResponse<Blob>) => {
        if (isPhone()) {
          this.fileSaverService.save(res.body, res.headers.get('content-disposition'));
        } else {
          printFile(res.body);
        }
      });
  }


  confirmChangeShiftStatus(shiftHistories: IShiftHistory): void {
    if (!shiftHistories.isActive) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Невозможно закрыть закрытую смену!'
      });
      return;
    }

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: this.sanitizer.bypassSecurityTrustHtml(`Вы действительно хотите
                                    <span style="color: #E95B54">Закрыть смену</span>
                                    <span style="font-weight: 700">${shiftHistories.merchantName}</span>?`),
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          this.changeActiveStatus(shiftHistories.id);
        }
      });
  }

  showDetail(id: string): void {
    if (!this.permissionService.getPermission('ShiftDetail')) return;
    this.router.navigate(['shift-history', id]).catch();
  }

  private getShift(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getShift(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.shiftHistories = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private changeActiveStatus(shiftId: string): void {
    this.loading.set(true);
    this.service.changeActiveStatus(shiftId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        if (res.status) {
          this.getShift()
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns, []);
          this.getShift(params);
        }
      });
  }
}
