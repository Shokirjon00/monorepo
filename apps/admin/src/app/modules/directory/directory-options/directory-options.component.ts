import { AfterViewInit, Component, Inject, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from "@shared/components/table/table.component";
import { IDirectoryOptions } from "@modules/directory/directory-options/interfaces/directory-options.interfaces";
import { ICaption, IOptionAction, IRowAction } from "@core/interfaces/table.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ITab } from "@core/interfaces/header.interface";
import { IPaginate, ToastEnum } from '@eskhata/util';
import { IFilterParams } from "@core/interfaces/filter-params.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { DirectoryOptionsService } from "@modules/directory/directory-options/services/directory-options.service";
import { finalize, takeUntil } from "rxjs";
import { setDefaultFilterValue } from "@core/utils/route-param-parse";
import { parseFilterParams } from "@core/utils/filter-util";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MessageService } from "@core/services/message.service";
import { DomSanitizer } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

import { DirectoryOptionsConstants } from "@modules/directory/directory-options/directory-options.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-directory-options',
  templateUrl: './directory-options.component.html',
  styleUrls: ['./directory-options.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class DirectoryOptionsComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  directoryOptions: IDirectoryOptions[];
  loading: boolean;
  columns = DirectoryOptionsConstants.DIRECTORY_OPTIONS_COLUMNS;
  tableActions: IRowAction[] = DirectoryOptionsConstants.TABLE_ACTIONS
  optionActions: IOptionAction[] = DirectoryOptionsConstants.TABLE_SETTING_OPTIONS
  tabMenuItems: ITab[]= DirectoryConstants.HEADER_TABS
  captionKey = 'directory-options';
  actions: IAction[] = DirectoryOptionsConstants.DIRECTORY_OPTIONS_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(DirectoryOptionsService);
  private readonly sanitizer = inject(DomSanitizer);
  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getDirectoryOptions(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.directoryOptions);
  }

  detail(directoryOptionsId: string): void {
    this.router.navigate(['directory/directory-options/info', directoryOptionsId]).catch();
  }

  edit(directoryOptionsId: string): void {
    this.router.navigate(['directory/directory-options/edit', directoryOptionsId]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getDirectoryOptions();
  }

  private getDirectoryOptions(params = this.filterParams): void {
    this.loading = true;
    this.service.getDirectoryOptions(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.directoryOptions = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  confirmChangeStatus(directoryOptions: IDirectoryOptions): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: this.sanitizer
          .bypassSecurityTrustHtml(
            `Вы действительно хотите
                    <span style="color: ${directoryOptions.isActive ? '#E95B54' : '#11a40c'}">
                    ${directoryOptions.isActive ? 'Деактивировать' : 'Активировать'}</span>
                    <span style="font-weight: 700">${directoryOptions.name}</span>?`),
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.changeActiveStatus(directoryOptions.id)
        }
      });
  }

  private changeActiveStatus(id: string): void {
    this.loading = true;
    this.service.changeActiveStatus(id)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        if (res.status) {
          this.getDirectoryOptions()
        }
      })
  }
}
