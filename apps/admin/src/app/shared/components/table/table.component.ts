import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, inject,
  Input,
  Output, signal,
  viewChild
} from '@angular/core';
import { TableFieldTypes, TableRowActionEnum } from '@core/enums/table';
import { ICaption, IOptionAction, IRowAction } from '@core/interfaces/table.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableStatusEnum } from '@core/enums/table-status.enum';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from '@core/services/header.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { ResizeColumnModule } from '@core/directives/resize-column/resize-column.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { CommonModule } from '@angular/common';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { NgxMaskPipe } from 'ngx-mask';
import { Clipboard } from '@angular/cdk/clipboard';
import moment from "moment/moment";
import { DateFormatEnum } from "@core/enums/date-format.enum";
import { TableCellTooltipDirective } from "@core/directives/table-cell-tooltip.directive";
import { TableConstants } from "@shared/components/table/table.constants";
import { RatingComponent } from "@shared/components/rating/rating.component";

@Component({
  standalone: true,
  selector: 'em-table',
  templateUrl: './table.component.html',
  imports: [
    ResizeColumnModule,
    AngularSvgIconModule,
    ClickOutsideModule,
    CommonModule,
    NgxPermissionsModule,
    ToastComponent,
    DateTimePipe,
    NgxMaskPipe,
    TableCellTooltipDirective,
    RatingComponent
  ],
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends DestroyableComponent implements AfterViewInit {
  private readonly tableContainer = viewChild<ElementRef>('tableContainer');

  @Input() dataSource: any[];
  @Input() captions: ICaption[];
  @Input() page: IPaginate;
  @Input() columnResize: boolean = true;
  @Input() rowActions: IRowAction[];
  @Input() optionActions: IOptionAction[];
  @Input() linkField: string;
  @Input() fileStorageToken: string;
  @Input() fileStorageUrl: string;
  @Input() loading: boolean = false;
  @Output() detail = this.register(new EventEmitter());
  @Output() navigate = this.register(new EventEmitter());
  @Output() update = this.register(new EventEmitter());
  @Output() edit = this.register(new EventEmitter());
  @Output() settingEdit = this.register(new EventEmitter());
  @Output() remove = this.register(new EventEmitter());
  @Output() refund = this.register(new EventEmitter());
  @Output() pageChanged = this.register(new EventEmitter());
  @Output() sortChange = this.register(new EventEmitter());
  @Output() print = this.register(new EventEmitter());
  @Output() changeStatus = this.register(new EventEmitter());
  @Output() checkStatus = this.register(new EventEmitter());
  @Output() selectedItems = this.register(new EventEmitter());
  @Output() link = this.register(new EventEmitter());
  @Output() confirm = this.register(new EventEmitter());
  @Output() touchStart = new EventEmitter<string>();
  @Output() changeStatusModal = this.register(new EventEmitter());
  @Output() setOperatorModal = this.register(new EventEmitter());

  isDown = false;
  isScrolled = false;
  startX: number;
  scrollLeft: number;
  emptyRows: Array<number> = new Array(6);
  columnSort: { [key: string]: boolean } = {};
  statusCode = TableStatusEnum;
  applicationStatusClasses = TableConstants.applicationStatusClasses;
  paymentStatusClasses = TableConstants.paymentStatusClasses;
  supportStatusClasses = TableConstants.supportStatusClasses;
  dragTracer: { src: number, dest: number }
  allCaption: ICaption[];
  showInfo: boolean
  selectIds: string[] = [];
  tableFieldTypes = TableFieldTypes;
  tableRowActionEnum = TableRowActionEnum;
  selectedRow = signal<string | null>(null);

  private scrollListener = this.onScroll.bind(this);
  private _captionKey: string;
  private lastTouchTime: number = 0;
  private doubleTapThreshold = 250;
  private http = inject(HttpClient);
  private changeDetector = inject(ChangeDetectorRef);
  private headerService = inject(HeaderService);
  private messageService = inject(MessageService);
  private clipboard = inject(Clipboard)

  constructor() {
    super();
    this.headerService.clearTableItemIds$.subscribe(res => res ? this.selectIds = [] : '');
  }

  @Input() set captionKey(value: string) {
    this._captionKey = value;
  }

  @Input() set emptyRowCount(count: number) {
    this.emptyRows = new Array(count);
  }

  get isCentered(): boolean {
    return this.rowActions?.length === 1 && !this.optionActions?.length;
  }

  ngAfterViewInit(): void {
    document.addEventListener('scroll', this.scrollListener, true);
  }

  render(caption: ICaption[], data: any): void {
    if (!Array.isArray(caption)) {
      throw new Error('caption аргумент не массив');
    }

    const localCaptionsStr = localStorage.getItem(this._captionKey);
    const localCaption: ICaption[] =
      localCaptionsStr && Array.isArray(JSON.parse(localCaptionsStr))
        ? JSON.parse(localCaptionsStr)
        : [];

    const captionField: Record<string, ICaption> = {};
    caption.forEach(item => (captionField[item.field] = item));

    const localCaptionField: Record<string, ICaption> = {};
    localCaption.forEach(item => (localCaptionField[item.field] = item));

    const compareCaption = Object.keys(captionField).some(
      key => localCaptionField[key]?.key !== captionField[key].key
    );

    if (compareCaption || localCaption.length === 0) {
      this.captions = caption.filter(x => x.isSelected);
      this.allCaption = caption;
    } else {
      this.captions = localCaption.filter(x => x.isSelected);
      this.allCaption = localCaption;
    }

    this.dataSource = data;
    this.resetDragTracer();
    this.changeDetector.detectChanges();
  }

  toggleMenu(event: MouseEvent, id: string): void {
    if (this.selectedRow() === id) {
      this.selectedRow.set(null);
    } else {
      this.selectedRow.set(id);
    }
    event.stopPropagation();
  }

  toggleCaption(index: number): void {
    const isSelected = this.allCaption[index].isSelected;
    this.allCaption[index].isSelected = !isSelected;
    this.captions = this.allCaption.filter(x => x.isSelected);
    this.captions.forEach((x, i) => x.index = i)
    localStorage.setItem(this._captionKey, JSON.stringify(this.allCaption))
  }

  onDragstart(i: number): void {
    this.dragTracer.src = i;
  }

  onDragover(i: number): void {
    this.dragTracer.dest = i
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

    const ascending = (a: any, b: any): any => a.index > b.index ? 1 : -1;

    this.captions.sort(ascending);
    this.allCaption.sort(ascending);
    this.captions.forEach((x, i) => x.index = i);
    this.allCaption.forEach((x, i) => x.index = i);

    this.resetDragTracer();
  }

  onDetail(id: string): void {
    this.detail.emit(id);
  }

  onTouchStart(id: string): void {
    this.touchStart.emit(id);
  }

  onTouchEnd(id: string): void {
    const currentTime = new Date().getTime();
    if (currentTime - this.lastTouchTime <= this.doubleTapThreshold) {
      this.detail.emit(id);
      this.lastTouchTime = 0;
    } else {
      this.lastTouchTime = currentTime;
    }
  }

  changedStatus(item: any): void {
    this.changeStatus.emit(item);
    this.selectedRow.set(null);
  }

  checkedStatus(item: any, key: string): void {
    this.checkStatus.emit({item, key});
    this.selectedRow.set(null);
  }

  changedClose(item: any): void {
    this.changeStatus.emit(item);
    this.selectedRow.set(null);
  }

  rowActionChange(rowActionType: string, itemId: string, defaultValue?: boolean): void {

    switch (rowActionType) {
      case TableRowActionEnum.EDIT:
        this.edit.emit(itemId)
        break;
      case TableRowActionEnum.SETTING:
        this.settingEdit.emit(itemId)
        break;
      case TableRowActionEnum.DELETE:
        this.remove.emit(itemId);
        break;
      case TableRowActionEnum.REFUND:
        this.refund.emit(itemId);
        break;
      case TableRowActionEnum.PRINT:
        this.print.emit(itemId);
        break;
      case TableRowActionEnum.CONFIRM:
        this.confirm.emit({itemId, defaultValue});
        break;
      case TableRowActionEnum.CHANGE_STATUS_MODAL:
        this.changeStatusModal.emit(itemId);
        break;
      case TableRowActionEnum.SET_OPERATOR_MODAL:
        this.setOperatorModal.emit(itemId);
        break;
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.isDown = true;
    this.isScrolled = false;
    this.startX = event.pageX - this.tableContainer().nativeElement.offsetLeft;
    this.scrollLeft = this.tableContainer().nativeElement.scrollLeft;
  }

  onMouseUp(): void {
    this.isDown = false;
  }

  onMouseLeave(): void {
    this.isDown = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDown) return;
    this.isScrolled = true;
    event.preventDefault();
    const table = event.currentTarget as HTMLElement;
    const x = event.pageX - table.parentElement.offsetLeft;
    const walk = (x - this.startX);
    this.tableContainer().nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  downloadFile(fileStorageUrl: string, fileId: string, token: string): void {
    const baseUrl = `${fileStorageUrl}web/${fileId}?t=${encodeURIComponent(token)}`;
    const url = `${baseUrl}&_=${Date.now()}`;

    this.http.head(baseUrl, {
      observe: 'response'
    })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          const contentType = res.headers.get('content-type') || '';

          if (contentType.includes('application/json')) {
            this.showError();
            return;
          }

          window.open(url, '_blank');
        },
        error: () => {
          this.showError();
        }
      });
  }

  private showError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Не удается скачать файл',
      detail: 'Обратитесь к администратору'
    });
  }

  onRemove(id: string): void {
    this.remove.emit(id);
  }

  copyToClipBoard(event: MouseEvent, value: string, pipe: string = null): void {
    if (this.isScrolled) return;

    if (pipe == "dateTime") {
      value = moment(value).format(DateFormatEnum.DATE_TIME_LOCAL_FORMAT)
    }

    if (pipe == "time") {
      value = moment(value).format(DateFormatEnum.TIME)
    }

    this.clipboard.copy(value ?? "Пустое значение");

    const tooltip = document.createElement('div');
    tooltip.textContent = 'Скопирован';
    tooltip.classList.add('copied-tooltip');

    tooltip.style.top = (event.pageY - 50) + 'px';
    tooltip.style.left = (event.pageX - 30) + 'px';
    tooltip.style.position = 'absolute'
    document.body.appendChild(tooltip);

    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 1000);
  }

  openDetailLink(dataSourceId: string, fieldName: string, value: string = ""): void {
    this.link.emit({dataSourceId, fieldName, value})
  }

  getCaption(value: string): void {
    this.columnSort[value] = !this.columnSort[value];
    this.sortChange.emit(this.columnSort[value] ? value : '-' + value);
  }

  statusIndicator(data: any): string {
    if (data?.paymentStatusGroupId === this.statusCode.COMPLETED && !data?.isCompleted) {
      return 'process-completed';
    }
    return this.paymentStatusClasses[data?.paymentStatusGroupId] || '';
  }

  applicationStatusIndicator(statusId: string): string {
    return this.applicationStatusClasses[statusId] || '';
  }

  supportStatusIndicator(supportApplicationStatusId: string): string {
    return this.supportStatusClasses[supportApplicationStatusId] || '';
  }


  getIndicatorClass(data: any): string {
    if (data?.paymentStatusGroupId) {
      return this.statusIndicator(data);
    }

    if (data?.supportApplicationStatusId) {
      return this.supportStatusIndicator(data.supportApplicationStatusId);
    }

    return this.applicationStatusIndicator(data?.statusId);
  }

  changeAllItem(evt: Event): void {
    this.selectIds = []
    if ((<HTMLInputElement>evt.target).checked) {
      this.selectIds = this.dataSource.map(item => (item.id));
    } else {
      this.selectIds = []
    }
    this.headerService.setTableItemIds(this.selectIds);
    this.selectedItems.emit(this.selectIds);
  }

  changeItem(id: string, evt: Event): void {
    if ((<HTMLInputElement>evt.target).checked) {
      this.selectIds.push(id)
    } else {
      const idxId = this.selectIds.findIndex((item: string) => item === id);
      this.selectIds.splice(idxId, 1)
    }
    this.headerService.setTableItemIds(this.selectIds);
    this.selectedItems.emit(this.selectIds);
  }

  private onScroll(event: Event): void {
    if (this.selectedRow()) {
      this.selectedRow.set(null);
    }
  }

  private resetDragTracer(): void {
    this.dragTracer = {
      src: -1,
      dest: -1
    }
  }

}
