import {
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit, output,
  viewChild
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@eskhata/util';
import { AutocompleteService } from '@core/services/autocomplete.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ISelect } from '@core/interfaces/select.interface';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { parseFilterParams } from '@core/utils/filter-util';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { isPhone } from '@core/helper';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { environment as env } from '@environments/environment';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'em-multi-dropdown',
  templateUrl: './multi-dropdown.component.html',
  styleUrls: ['./multi-dropdown.component.scss'],
  imports: [AngularSvgIconModule, ReactiveFormsModule, SharedModule, ClickOutsideModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiDropdownComponent),
      multi: true,
    },
  ],
})
export class MultiDropdownComponent extends DestroyableComponent implements OnInit, OnDestroy {
  readonly searchElem = viewChild<ElementRef>('searchElem');
  @Input() action: string = '';
  @Input() canSearch?: boolean;
  @Input() emptyMessage?: string = 'Нет данных';
  @Input() labelIcon: string;
  @Input() labelKey = 'name';
  @Input() path: string;
  @Input() scrollHeight: string = '200px';
  @Input() searchPlaceholder?: string = 'Название элемента';
  @Input() selected?: any[] = [];
  @Input() selectedIndex: number;
  @Input() selectedId: string | string[];
  @Input() show: boolean = true;
  @Input() type: string;
  @Input() valueKey = 'id';
  @Input() images: [];
  @Input() showClear: boolean;
  @Input() isMultiSelect: boolean = false;
  @Input() flag: boolean = false;
  @Input() maxHeight: string = '340px';
  @Input() isBottomSheet: boolean = false;

  readonly uniqueId = input<string>('');

  readonly changed = output<any>();
  readonly clearInput = output();
  readonly allIds = output<string[]>();

  loading: boolean;
  open: boolean;
  searchField$ = new FormControl('');
  value: any;
  pagination: IPaginate;
  isMobile = isPhone();
  dropdownId: string;
  clearButtonId: string;

  onChange: any = () => {};
  onTouched: any = () => {};

  private pathSub: Subscription;
  private _dataSource: any[];
  private _customFilter: any;
  private service = inject(AutocompleteService);
  private route = inject(ActivatedRoute);
  private bottomSheet = inject(MatBottomSheet);

  queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    filters: '',
    pageSize: 15,
  };

  get dataSource(): any[] {
    return this._dataSource;
  }

  @Input() set dataSource(value: any[]) {
    this._dataSource = value;
  }

  @Input() set customFilter(data: { [key: string]: any }) {
    this._customFilter = data;
    this.searchItems(data);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.setQueryParams(params);
    });
    if (this.path) {
      this.searchData(this.path);
    }
  }

  onScrolled(): void {
    this.queryParams.page += 1;
    this.searchData(this.path, true);
  }

  toggle(): void {
    if (this.show && this.isMobile && this.isBottomSheet) {
      this.bottomSheet
        .open(BottomSheetComponent, {
          panelClass: 'bottom-sheet',
          disableClose: true,
          data: {
            dataSource: this.dataSource,
            selected: this.selected,
            canSearch: this.canSearch,
            searchPlaceholder: this.searchPlaceholder,
            path: this.path,
            customFilters: this._customFilter,
            isMultiSelect: true,
            queryParams: this.queryParams,
          },
        })
        .afterDismissed()
        .subscribe(option => {
          if (option.length) {
            this.selected = option;
            this.onChange(this.emittedValue(this.selected));
            this.changed.emit(this.emittedValue(this.selected));
          } else {
            this.clearInput.emit();
          }
        });
    } else {
      if (this.show) {
        if (this.path) {
          this.searchData(this.path);
        }
        this.open = !this.open;
        if (this.canSearch && this.open) {
          this.setTimeout(this.searchElem()?.nativeElement.focus(), 0);
        }
      }
    }
  }

  onSelect(option: any): void {
    if (this.isMultiSelect) {
      const found = this.isSelected(option);
      if (!found) {
        this.addSelected(option);
      } else {
        this.removeSelected(option);
      }
    } else {
      this.selected = [];
      this.changed.emit(option.id);
      this.onChange(option.id);
      this.setQueryParams(this.route.snapshot.queryParamMap);
      this.onTouched();
      this.searchField$.setValue('', { emitEvent: true });
      this.selected.push(option);
      this.open = false;
    }
  }

  isSelected(clickedItem: ISelect | any): boolean {
    return this.selected[0]?.id && this.selected.some((item: any) => clickedItem?.id === item?.id);
  }

  addSelected(item: ISelect[]): void {
    if (!this.selected[0]?.id) {
      this.selected = [];
    }
    this.selected.push(item);
    this.onChange(this.emittedValue(this.selected));
    this.changed.emit(this.emittedValue(this.selected));
  }

  removeSelected(value: ISelect | Event): void {
    const data = this.selected.findIndex((item: any) => item === value);
    this.selected.splice(data, 1);
    this.onChange(this.emittedValue(this.selected));
    this.changed.emit(this.emittedValue(this.selected));
    if (!this.selected.length) {
      this.clearInput.emit();
    }
  }

  emittedValue(value: any): any {
    const selected: Array<any> = [];
    if (Array.isArray(value)) {
      value.forEach(item => selected.push(item.id));
    } else if (value) {
      return value;
    }
    return selected;
  }

  setIcon(): void {
    this.dataSource.forEach((item, i) => (item.icon = this.images[i]));
  }

  clear(e: Event): void {
    if (this.isMultiSelect) {
      this.removeSelected(e);
    } else {
      this.clearInput.emit();
      e.stopPropagation();
    }
  }

  getDropdownItemId(index: number): string {
    const baseId = this.uniqueId() || 'dropdown';
    this.clearButtonId = `${baseId}-clear`;
    return `${baseId}-item-${index}`;
  }

  writeValue(value: string | string[]): void {
    if (this.dataSource && value !== null) {
      const timer = setInterval(() => {
        if (Array.isArray(value)) {
          this.selected = this.dataSource.filter(item => value.includes(item[this.valueKey]));
        } else {
          this.selected = this.dataSource.filter(item => item[this.valueKey] === value);
        }
        if (this.selected.length) {
          this.changed.emit(this.selected);
          clearInterval(timer);
        }
      }, 300);
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private searchData(path: string, scrolled: boolean = false): void {
    let value = '';

    if (this.pathSub) {
      this.pathSub.unsubscribe();
    }

    this.pathSub = this.searchField$.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(500),
        switchMap((searchValue: any) => {
          value = searchValue;
          this.loading = true;
          if (!scrolled) {
            this.queryParams.page = 1;
          }
          if (this._customFilter) {
            this.queryParams = parseFilterParams({ name: '', ...this._customFilter }, this.queryParams, []);
          } else {
            this.queryParams = parseFilterParams({ name: searchValue }, this.queryParams, []);
          }
          return this.service.getSearchData(path, this.queryParams).pipe(finalize(() => (this.loading = false)));
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.data?.length) {
          this.dataSource = scrolled ? this.dataSource.concat(res.data) : res.data;
          const ids = this.dataSource.map(item => item[this.valueKey]);
          this.allIds.emit(ids);

          if (scrolled) {
            this.dataSource = this.dataSource.concat(res.data);
            scrolled = false;
          } else {
            this.dataSource = res.data;
          }
          if (this.selectedIndex) {
            this.selected = this.dataSource[this.selectedIndex];
          }
          if (this.selectedId) {
            this.selected = [];
            if (Array.isArray(this.selectedId)) {
              for (const id of this.selectedId) {
                const selectedItem = this.dataSource.find(item => id === item.id);
                if (selectedItem) {
                  this.selected.push(selectedItem);
                }
              }
            } else {
              const selectedItem = this.dataSource.find(item => item.id === this.selectedId);
              if (selectedItem) this.selected.push(selectedItem);
            }
          }

          if (this.images && this.images.length) {
            this.setIcon();
          }
          this.pagination = res.meta?.pagination;
          this.pagination = res.meta?.pagination;
        } else {
          this.dataSource = res.data;
        }
      });
  }

  private searchItems(filterData: any): void {
    this.queryParams = parseFilterParams({ name: '', ...this._customFilter }, this.queryParams, []);
    this.loading = true;
    if (this.pathSub && !this.pathSub.closed) {
      this.pathSub.unsubscribe();
    }
    this.pathSub = this.service
      .getSearchData(this.path, this.queryParams)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.dataSource = res.data;
        const ids = this.dataSource.map(item => item[this.valueKey]);
        this.allIds.emit(ids);

        if (res.data?.length && this.selectedId?.length) {
          this.selected = this.dataSource.filter(item => this.selectedId.includes(item.id));
          this.changed.emit(this.emittedValue(this.selected));
        }
        if (!res.data?.length) {
          this.selected = [];
          this.clearInput.emit();
          this.changed.emit(this.emittedValue(this.selected));
        }
      });
  }

  private setQueryParams(params: ParamMap): void {
    if (!this.path) return;
    let selectedList = null;
    if (this.path.includes(env.api.poses) && params.getAll('posId').length) {
      selectedList = params.getAll('posId').filter(item => item?.toString().trim());
    } else if (this.path.includes(env.api.merchants) && params.getAll('merchantId').length) {
      selectedList = params.getAll('merchantId').filter(item => item?.toString().trim());
    }
    this.queryParams = {
      ...this.queryParams,
      selectedList: selectedList,
    };
  }
}
