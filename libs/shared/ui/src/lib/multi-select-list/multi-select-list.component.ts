import { ChangeDetectorRef, Component, forwardRef, inject, Input, OnInit, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { FILTER_PARAMS_PARSER, MultiSelectService } from '@eskhata/data-access';
import {
  ClickOutsideModule,
  DestroyableComponent,
  IFilterParams,
  IMultiSelect,
  InfiniteScrollDirective,
  IPaginate,
  IParam,
  ListItem,
} from '@eskhata/util';

const noop = (): void => {
};

@Component({
  selector: 'em-multi-select-list',
  templateUrl: './multi-select-list.component.html',
  styleUrls: ['./multi-select-list.component.scss'],
  standalone: true,
  imports: [
    InfiniteScrollDirective,
    SvgIconComponent,
    ClickOutsideModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectListComponent),
      multi: true
    }
  ]
})
export class MultiSelectListComponent extends DestroyableComponent implements OnInit, ControlValueAccessor {
  @Input() show: boolean = true;
  open: boolean;
  readonly dropDownClose = output<void>();
  readonly selected = output<any>();
  readonly deSelect = output<any>();
  readonly placeholder = input('');
  readonly maxHeight = input<string>('340px');
  readonly path = input<string>();
  readonly notParams = input<boolean>(false);
  selectedItems: Array<ListItem> = [];
  dataItems: Array<ListItem> = [];
  pagination: IPaginate;
  loading: boolean;
  ownSelectedItem: any = [];
  settings: IMultiSelect = {
    idField: 'id',
    textField: 'name',
    disabledField: 'isDisabled',
  };
  dataSource: Array<ListItem> = [];

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  private _customFilter: { [key: string]: any };
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);
  private service = inject(MultiSelectService);
  private parseFilterParams = inject(FILTER_PARAMS_PARSER);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  @Input() set customFilter(data: { [key: string]: any }) {
    this._customFilter = data;
    const value = Object.keys(data);
    if (this._customFilter[value[0]]) {
      this.searchItems(data);
    }
  }

  ngOnInit(): void {
    this.getItems();
  }

  onItemClick($event: any, item: ListItem): boolean {
    if (item.isDisabled) {
      return false;
    }
    const found = this.isSelected(item);
    if (!found) {
      this.addSelected(item);
    } else {
      this.removeSelected(item);
    }
  }

  onScrolled(): void {
    this.queryParams.page += 1;
    this.service.getItems(this.path(), this.queryParams)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.data) {
          this.dataSource = this.convertToArray(res.data);
          this.dataItems = this.dataItems.concat(this.dataSource || []);
          this.pagination = res.meta.pagination;
          for (const ownItemId of this.ownSelectedItem) {
            const selectedItem = this.dataSource.find(item => ownItemId === item.id)
            if (selectedItem) {
              this.selectedItems.push(selectedItem)
            }
          }
        } else {
          this.dataSource = [];
        }
      });
    this.cdr.markForCheck();

  }

  writeValue(value: any): void {
    if (!value?.length) {
      this.selectedItems = [];
      return;
    }
    this.ownSelectedItem = value
    this.show = true;
    let stringId = '';

    if (!this.notParams()) {
      stringId = value.join('|');
    }
    const params: any = {};
    if (stringId) {
      params['filters=id='] = stringId;
    }
    this.loading = true;
    this.service.getItems(this.path(), params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        const items: Array<ListItem> = this.convertToArray(res.data);
        for (const ownItemId of this.ownSelectedItem) {
          const selectedItem = items.find(item => ownItemId === item.id);
          if (selectedItem) {
            this.selectedItems.push(selectedItem)
          }
        }
      });
    this.cdr.markForCheck();
  }

  getItems(scrolled: boolean = false): void {
    if (!scrolled) {
      this.queryParams.page = 1
    }
    this.service.getItems(this.path())
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.data) {
          this.dataItems = this.convertToArray(res.data);
        } else {
          this.dataItems = [];
        }
        this.pagination = res.meta?.pagination;
      })
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  isSelected(clickedItem: ListItem): boolean {
    return this.selectedItems.some(item => clickedItem?.id === item?.id);
  }

  addSelected(item: ListItem): void {
    this.selectedItems.push(item);
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.selected.emit(this.emittedValue(this.selectedItems));
  }

  removeSelected(value: ListItem): void {
    const index = this.selectedItems.findIndex(item => item?.id === value?.id);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
      this.onChangeCallback(this.emittedValue(this.selectedItems));
      this.deSelect.emit(this.emittedValue(this.selectedItems));
    }
  }

  emittedValue(value: any): any {
    const selected: Array<any> = [];
    if (Array.isArray(value)) {
      value.forEach(item => selected.push(item.id));
    } else {
      if (value) return value;
    }
    return selected;
  }

  convertToArray(data: any): any {
    return data?.map((item: any) =>
      typeof item === 'string' || typeof item === 'number'
        ? new ListItem(item)
        : new ListItem({
          id: item[this.settings?.idField],
          text: item[this.settings?.textField],
          isDisabled: item[this.settings?.disabledField]
        })
    );
  }

  closeDropdown(): void {
    this.open = false;
    this.dropDownClose.emit();
  }

  toggle(): void {
    this.open = !this.open;
  }

  private searchItems(filterData: IParam | Params, scrolled: boolean = false): void {
    if (!scrolled) {
      this.queryParams.page = 1
    }
    const params = this.parseFilterParams({...filterData}, this.queryParams, []);
    this.loading = true;
    this.service.getItems(this.path(), params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.dataItems = this.convertToArray(res.data));
  }
}
