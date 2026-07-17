import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, WritableSignal, viewChild } from "@angular/core";

import { TableComponent } from "@shared/components/table/table.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ICaption, IFilterParams, IOptionAction, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { finalize } from "rxjs/operators";
import { ITab } from "@core/interfaces/header.interface";
import { NgxPermissionsService } from "ngx-permissions";
import { ShiftsConstants } from "@modules/main-terminal/shifts/shifts.constants";
import { ShiftsService } from "@modules/main-terminal/shifts/services/shifts.service";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { IShift } from "@modules/main-terminal/shifts/interfaces/shifts.interface";
import { HttpResponse } from "@angular/common/http";
import { isPhone } from "@core/helper";
import { printFile } from "@core/utils/print-file";
import { FileSaverService } from "ngx-filesaver";
import { IAction } from "@shared/components/actions/actions.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataSourceService } from "@core/services/data-source.service";
import { ToastEnum } from '@eskhata/util';
import { DomSanitizer } from "@angular/platform-browser";
import { MessageService } from "@core/services";

@Component({
  standalone: true,
  selector: 'em-pos-terminal',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  imports: [
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent
],
  providers: [
    ShiftsService,
    DataSourceService
  ],
})
export class ShiftsComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: WritableSignal<boolean> = signal(false);
  posTerminal: IShift[];
  actions: IAction[] = ShiftsConstants.ACTIONS;
  columns = ShiftsConstants.SHIFT_HISTORY_COLUMNS;
  tableActions = ShiftsConstants.TABLE_ACTIONS;
  optionActions: IOptionAction[] = ShiftsConstants.OPTION_ACTIONS;
  tabMenuItems: ITab[] = ShiftsConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'shifts';
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ShiftsService);
  private readonly permissionService = inject(NgxPermissionsService);
  private readonly dialog = inject(MatDialog);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly messageService = inject(MessageService);
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
    this.table().render(this.columns, this.posTerminal);
  }

  showDetail(shiftsId: string): void {
    if (!this.permissionService.getPermission('PosTerminalDetail')) return;
    this.router.navigate(['/main-terminal/shifts', shiftsId, 'info']).catch();
  }

  link(dataDetail: {dataSourceId: string, fieldName: string}): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.posTerminal.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getShiftsList();
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
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(selectedTypeId => {
          if (selectedTypeId) {
            this.getCheckInfo(shiftId, selectedTypeId);
          }
        });
    });
  }

  confirmChangeStatus(shiftHistories: IShift): void {
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
          this.getShiftsList();
        }
      })
  }

  private getCheckInfo(shiftId: string, typeId: string): void {
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

  private getShiftsList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getShift(params)
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
          this.getShiftsList(params);
        }
      });
  }

}
