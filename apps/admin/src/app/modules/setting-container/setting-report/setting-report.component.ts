import {AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild} from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import {ICaption, IRowAction} from '@eskhata/util';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {finalize, takeUntil} from 'rxjs';
import {DestroyableComponent} from '@eskhata/util';
import {IPaginate} from '@eskhata/util';
import {IFilterParams} from '@eskhata/util';
import {ITab} from '@eskhata/util';
import {parseFilterParams} from '@core/utils/filter-util';
import {setDefaultFilterValue} from '@eskhata/util';
import {SettingReportService} from '@modules/setting-container/setting-report/services/setting-report.service';
import {ISettingReport} from '@modules/setting-container/setting-report/interfaces/setting-report.interface';
import {EbLoaderComponent} from "@shared/components/eb-loader/eb-loader.component";
import {SettingReportConstants} from "@modules/setting-container/setting-report/setting-report.constants";
import {IAction} from '@eskhata/util';
import {HeaderService} from "@core/services";
import {ExportQueueDialog} from "@modules/setting-container/setting-report/export-queue-dialog/export-queue-dialog";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-register-balance',
  templateUrl: './setting-report.component.html',
  styleUrls: ['./setting-report.component.scss'],
  providers: [SettingReportService],
  imports: [TableComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent, ActionsComponent]
})

export class SettingReportComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  settingReports: ISettingReport[];
  fileStorageUrl: string;
  fileStorageToken: string;
  actions: IAction[] = SettingReportConstants.EXPORT_QUEUE_ACTIONS;
  columns: any = SettingReportConstants.SETTING_REPORT_COLUMNS;
  tableActions: IRowAction[] = SettingReportConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = SettingReportConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'setting';
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SettingReportService);
  private readonly store = inject(HeaderService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.initDialogListener();
    this.initQueryParamsListener();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.settingReports);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getSettingReports()
  }

  edit(id: string): void {
    this.router.navigate(['/setting/report/edit', id])
      .catch()
  }

  private initDialogListener(): void {
    this.store.getDialog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res === 'stamp-dialog') {
          this.addStamp();
        }
      });
  }

  private initQueryParamsListener(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.handleQueryParamsChange(res);
      });
  }

  private handleQueryParamsChange(params: Params): void {
    this.params = params;
    this.filterParams = setDefaultFilterValue(params, this.captionKey);
    const parsedParams = parseFilterParams(params, this.filterParams, this.columns);
    this.getSettingReports(parsedParams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.params
    }).catch();
  }

  private addStamp(): void {
    const dialogExist = this.dialog.getDialogById('stamp-dialog');
    if (dialogExist) return;
    this.dialog.open(ExportQueueDialog, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      id: 'stamp-dialog',
      data: {
        title: 'Штамп',
        successButtonText: 'Сохранить',
        cancelButtonText: 'Отменить'
      }
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => {
        this.store.setDialog(null);
      })
  }

  private getSettingReports(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getSettingReports(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.settingReports = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.paginate = res.meta.pagination;
        }
      })
  }

}
