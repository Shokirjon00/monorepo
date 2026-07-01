import { ChangeDetectorRef, Component, forwardRef, inject, Input, OnInit, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IPaginate } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs/operators';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { MultiSelectService } from '@core/services/multi-seelct.service';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { parseFilterParams } from '@core/utils/filter-util';
import { IMultiSelect, ListItem } from '@core/interfaces/multi-select.interface';
import { IParam } from '@core/interfaces/param.interface';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';

const noop = (): void => {};

@Component({
  standalone: true,
  selector: 'em-multi-select-list',
  templateUrl: './multi-select-list.component.html',
  styleUrls: ['./multi-select-list.component.scss'],
  imports: [AngularSvgIconModule, ClickOutsideModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectListComponent),
      multi: true,
    },
  ],
})
export class MultiSelectListComponent extends DestroyableComponent implements OnInit, ControlValueAccessor {
  open: boolean;
  selectedItems: Array<ListItem> = [];
  dataItems: Array<ListItem> = [];
  pagination: IPaginate;
  loading: boolean;
  ownSelectedItem: any = {};
  settings: IMultiSelect = {
    idField: 'id',
    textField: 'name',
    disabledField: 'isDisabled',
  };
  dataSource: Array<ListItem> = [];
  @Input() placeholder = '';
  @Input() maxHeight: string = '340px';
  @Input() path: string;
  @Input() notParams: boolean = false;
  @Input() show: boolean = true;
  @Input() set customFilter(data: { [key: string]: any }) {
    this._customFilter = data;
    const value = Object.keys(data);
    if (this._customFilter[value[0]]) {
      this.searchItems(data);
    }
  }

  readonly dropDownClose = output<void>();
  readonly selected = output<any>();
  readonly deSelect = output<any>();

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  private _customFilter: { [key: string]: any };
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);
  private service = inject(MultiSelectService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    pageSize: 15,
  };

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
    this.service
      .getItems(this.path, this.queryParams)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.data) {
          this.dataSource = this.convertToArray(res.data);
          this.dataItems = this.dataItems.concat(this.dataSource || []);
          this.pagination = res.meta.pagination;
          for (let ownItemId of this.ownSelectedItem) {
            const selectedItem = this.dataSource.find(item => ownItemId === item.id);
            if (selectedItem) {
              this.selectedItems.push(selectedItem);
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
    this.ownSelectedItem = value;
    this.show = true;
    const stringId = !this.notParams && Array.isArray(value) ? value.join('|') : '';
    let params: any = {};
    if (stringId) {
      params['filters=id='] = stringId;
    }
    this.loading = true;
    this.service
      .getItems(this.path, params)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        let items: Array<ListItem> = this.convertToArray(res.data);
        for (let ownItemId of this.ownSelectedItem) {
          const selectedItem = items.find(item => ownItemId === item.id);
          if (selectedItem) {
            this.selectedItems.push(selectedItem);
          }
        }
      });
    this.cdr.markForCheck();
  }

  getItems(scrolled: boolean = false): void {
    if (!scrolled) {
      this.queryParams.page = 1;
    }
    this.service
      .getItems(this.path)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.data) {
          this.dataItems = this.convertToArray(res.data);
        } else {
          this.dataItems = [];
        }
        this.pagination = res.meta?.pagination;
      });
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
    const data = this.selectedItems.findIndex(item => item === value);
    this.selectedItems.splice(data, 1);
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.deSelect.emit(this.emittedValue(this.selectedItems));
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
            isDisabled: item[this.settings?.disabledField],
          })
    );
  }

  private searchItems(filterData: IParam | Params, scrolled: boolean = false): void {
    if (!scrolled) {
      this.queryParams.page = 1;
    }
    const params = parseFilterParams({ ...filterData }, this.queryParams, []);
    this.loading = true;
    this.service
      .getItems(this.path, params)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => (this.dataItems = this.convertToArray(res.data)));
  }

  closeDropdown(): void {
    this.open = false;
    this.dropDownClose.emit();
  }

  toggle(): void {
    this.open = !this.open;
  }
}
