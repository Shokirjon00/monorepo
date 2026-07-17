import { ChangeDetectorRef, Component, inject, Input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableFieldTypes, TableRowActionEnum } from '@core/enums/table';
import { ICaption, IOptionAction, IRowAction } from '@core/interfaces/table.interface';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { TableStatusEnum } from '@core/enums/table-status.enum';
import { IPaginate, ToastEnum } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HelperService } from '@core/services/helper.service';
import { FileSaverService } from 'ngx-filesaver';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TooltipDirective } from '@core/directives/tooltip.directive';
import { ResizeColumnDirective } from '@core/directives/resize-column/resize-column.directive';
import { MessageService } from '@core/services/message.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TableConstants } from '@shared/components/table/table.constants';
import { RatingComponent } from '@shared/components/rating/rating.component';

@Component({
  standalone: true,
  selector: 'em-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    CommonModule,
    AngularSvgIconModule,
    RouterModule,
    ClickOutsideModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    TooltipDirective,
    ResizeColumnDirective,
    DatePipe,
    RatingComponent,
  ],
})
export class TableComponent extends DestroyableComponent {
  @Input() tableFieldTypes = TableFieldTypes;
  @Input() dataSource: any[];
  @Input() captions: ICaption[];
  @Input() captionKey: string;
  @Input() loading: boolean = false;
  @Input() rowActions: IRowAction[];
  @Input() optionActions: IOptionAction[];
  @Input() page: IPaginate;
  @Input() columnResize: boolean = true;
  @Input() fileStorageToken: string;
  @Input() fileStorageUrl: string;

  readonly detail = output<any>();
  readonly navigate = output<any>();
  readonly update = output<any>();
  readonly edit = output<any>();
  readonly remove = output<any>();
  readonly refund = output<any>();
  readonly print = output<any>();
  readonly pageChanged = output<any>();
  readonly sortChange = output<any>();
  readonly confirm = output<any>();
  readonly changeStatus = output<any>();
  readonly changeShift = output<any>();

  columnSort: { [key: string]: boolean } = {};
  statusCode = TableStatusEnum;
  dragTracer: { src: number; dest: number };
  allCaption: ICaption[];
  showInfo: boolean;
  selectedRow: string;
  tableRowActionEnum = TableRowActionEnum;
  emptyRows: Array<number> = new Array(6);
  applicationStatusClasses = TableConstants.applicationStatusClasses;
  supportStatusClasses = TableConstants.supportStatusClasses;
  isuStatusClasses = TableConstants.isuStatusClasses;
  paymentStatusClasses = TableConstants.paymentStatusClasses;
  orderStatusClasses = TableConstants.orderStatusClasses;

  private helperService = inject(HelperService);
  private changeDetector = inject(ChangeDetectorRef);
  private fileSaverService = inject(FileSaverService);
  private messageService = inject(MessageService);

  isSelectableCaption(type: string): boolean {
    return (
      type !== this.tableFieldTypes.EDIT &&
      type !== this.tableFieldTypes.SELECT &&
      type !== this.tableFieldTypes.DELETE &&
      type !== this.tableFieldTypes.CONFIRM
    );
  }

  getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return '-';
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj) ?? '-';
  }

  toggleMenu(event: MouseEvent, id: string): void {
    if (this.selectedRow === id) {
      return (this.selectedRow = null);
    }
    this.selectedRow = id;
    event.stopPropagation();
  }

  render(caption: ICaption[], data: any): void {
    const saved = localStorage.getItem(this.captionKey);
    let localCaption: ICaption[] = [];
    try {
      const parsed = JSON.parse(saved || '[]');
      if (Array.isArray(parsed)) {
        localCaption = parsed;
      }
    } catch (e) {
      console.error('Failed to parse localStorage caption:', e);
    }
    if (localCaption.length) {
      this.captions = localCaption.filter(x => x.isSelected);
      this.allCaption = localCaption;
    } else {
      this.captions = caption.filter(x => x.isSelected);
      this.allCaption = caption;
    }
    this.dataSource = data;
    this.resetDragTracer();
    this.changeDetector.detectChanges();
  }

  toggleCaption(index: number): void {
    const isSelected = this.allCaption[index].isSelected;
    this.allCaption[index].isSelected = !isSelected;
    this.captions = this.allCaption.filter(x => x.isSelected);
    this.captions.forEach((x, i) => (x.index = i));
    localStorage.setItem(this.captionKey, JSON.stringify(this.allCaption));
  }

  onDragstart(i: number): void {
    this.dragTracer.src = i;
  }

  onDragover(i: number): void {
    this.dragTracer.dest = i;
  }

  onDragend(): void {
    const abort = this.dragTracer.src === -1 || this.dragTracer.dest - 1;
    if (abort) {
      this.resetDragTracer();
      return;
    }

    this.captions[this.dragTracer.src].index = this.dragTracer.dest;
    this.captions[this.dragTracer.dest].index = this.dragTracer.src;

    this.allCaption[this.dragTracer.src].index = this.dragTracer.dest;
    this.allCaption[this.dragTracer.dest].index = this.dragTracer.src;

    const ascending = (a: any, b: any): any => (a.index > b.index ? 1 : -1);

    this.captions.sort(ascending);
    this.allCaption.sort(ascending);
    this.captions.forEach((x, i) => (x.index = i));
    this.allCaption.forEach((x, i) => (x.index = i));

    this.resetDragTracer();
  }

  onDetail(row: any): void {
    this.detail.emit(row);
  }

  onRemove(row: any): void {
    this.remove.emit(row);
  }

  rowActionChange(rowActionType: string, row: any, defaultValue?: boolean): void {
    switch (rowActionType) {
      case TableRowActionEnum.EDIT:
        this.edit.emit(row);
        break;
      case TableRowActionEnum.DELETE:
        this.remove.emit(row);
        break;
      case TableRowActionEnum.REFUND:
        this.refund.emit(row);
        break;
      case TableRowActionEnum.PRINT:
        this.print.emit(row);
        break;
      case TableRowActionEnum.CONFIRM:
        this.confirm.emit({ itemId: row, defaultValue: defaultValue });
        break;
    }
  }

  downloadFile(fileStorageUrl: string, photoFileId: string, fileStorageToken: string): void {
    this.loading = true;
    this.helperService
      .getFile(fileStorageUrl, photoFileId, fileStorageToken)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe((res: HttpResponse<Blob>) => {
        if (res.headers.get('content-disposition')) {
          const contentDisposition = res.headers.get('content-disposition');
          const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const match = contentDisposition.match(regex);
          let fileName = 'download';
          if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, '');
          }
          this.fileSaverService.save(res.body, fileName);
        } else {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: 'Не удается скачать файл',
            detail: 'Обратитесь к администратору',
          });
        }
      });
  }

  getCaption(value: string): void {
    this.columnSort[value] = !this.columnSort[value];
    this.sortChange.emit(this.columnSort[value] ? value : '-' + value);
  }

  statusIndicator(data: any): string {
    if (data?.paymentStatusGroupId === this.statusCode.COMPLETED && !data?.isCompleted) {
      return 'completed';
    }
    return this.paymentStatusClasses[data?.paymentStatusGroupId] || '';
  }

  applicationStatusIndicator(statusId: string): string {
    return this.applicationStatusClasses[statusId] || '';
  }

  supportStatusIndicator(supportApplicationStatusId: string): string {
    return this.supportStatusClasses[supportApplicationStatusId] || '';
  }

  isuStatusIndicator(isuStatusId: string): string {
    return this.isuStatusClasses[isuStatusId] || '';
  }

  orderStatusIndicator(statusName: string): string {
    return this.orderStatusClasses[statusName] || '';
  }

  getIndicatorClass(data: any): string {
    if (data?.paymentStatusGroupId) {
      return this.statusIndicator(data);
    }

    if (data?.orderStatus?.name) {
      return this.orderStatusIndicator(data.orderStatus.name);
    }

    if (data?.supportApplicationStatusId) {
      return this.supportStatusIndicator(data.supportApplicationStatusId);
    }

    if (data?.statusId) {
      return this.isuStatusIndicator(data.statusId);
    }

    return this.applicationStatusIndicator(data?.statusId);
  }

  changedStatus(row: any): void {
    this.changeStatus.emit(row);
    this.selectedRow = null;
  }

  private resetDragTracer(): void {
    this.dragTracer = { src: -1, dest: -1 };
  }
}
