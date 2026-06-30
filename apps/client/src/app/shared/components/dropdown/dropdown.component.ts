import {
  AfterContentInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  input,
  inject,
  output,
  viewChild
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AutocompleteService } from '@core/services/autocomplete.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { isPhone } from '@core/helper';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { Subscription } from 'rxjs';
import { environment as env } from '@environments/environment';

@Component({
  standalone: true,
  selector: 'em-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [AngularSvgIconModule, ReactiveFormsModule, SharedModule, ClickOutsideModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent extends DestroyableComponent implements OnInit, AfterContentInit, OnDestroy {
  readonly searchElem = viewChild<ElementRef>('searchElem');
  @Input() selected?: any;
  readonly action = input<string>('');
  readonly canSearch = input<boolean>();
  readonly emptyMessage = input<string>('Нет данных');
  readonly labelIcon = input<string>();
  readonly labelKey = input('name');
  readonly path = input<string>();
  readonly scrollHeight = input<string>('200px');
  readonly searchPlaceholder = input<string>('Название элемента');
  readonly selectedIndex = input<number>();
  readonly selectedId = input<number>();
  readonly show = input<boolean>(true);
  readonly type = input<string>();
  readonly valueKey = input('id');
  readonly images = input<[]>();
  readonly showClear = input<boolean>();
  readonly flag = input<boolean>(false);
  readonly maxHeight = input<string>('340px');
  readonly isBottomSheet = input<boolean>(false);
  readonly uniqueId = input<string>('');

  readonly changed = output<any>();
  readonly clearInput = output<void>();
  loading: boolean;
  open: boolean;
  searchField$ = new FormControl('');
  value: any;
  pagination: IPaginate;
  isMobile = isPhone();
  clearButtonId: string;

  private pathSub: Subscription;
  private _dataSource: any[];
  private _customFilter: any;
  private service = inject(AutocompleteService);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
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
    this.searchData(this.path());
  }

  onScrolled(): void {
    this.queryParams.page += 1;
    this.searchData(this.path(), true);
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  toggle(): void {
    const show = this.show();
    if (show && this.isMobile && this.isBottomSheet()) {
      this.bottomSheet
        .open(BottomSheetComponent, {
          panelClass: 'bottom-sheet',
          data: {
            dataSource: this.dataSource,
            selected: this.selected,
            canSearch: this.canSearch(),
            searchPlaceholder: this.searchPlaceholder(),
            path: this.path(),
            customFilters: this._customFilter,
            queryParams: this.queryParams,
          },
        })
        .afterDismissed()
        .subscribe(option => option && this.onSelect(option));
    } else {
      if (show) {
        this.open = !this.open;
        if (this.canSearch() && this.open) {
          this.setTimeout(this.searchElem()?.nativeElement.focus(), 0);
        }
      }
    }
  }

  onSelect(option: any): void {
    const valueKey = this.valueKey();
    this.changed.emit(option[valueKey]);
    this.onChange(option[valueKey]);
    this.onTouched();
    this.searchField$.setValue('', { emitEvent: true });
    this.selected = option;
    this.open = false;
  }

  setIcon(): void {
    this.dataSource.forEach((item, i) => (item.icon = this.images()[i]));
  }

  clear(e: Event): void {
    this.clearInput.emit();
    e.stopPropagation();
  }

  getDropdownItemId(index: number): string {
    const baseId = this.uniqueId() || 'dropdown';
    this.clearButtonId = `${baseId}-clear`;
    return `${baseId}-item-${index}`;
  }

  writeValue(value: string): void {
    if (this.dataSource && value !== null) {
      this.setTimeout(() => {
        this.selected = (this.dataSource || []).find(item => item[this.valueKey()] === value);
        const selected = this.selected;
        if (selected) {
          this.changed.emit(selected);
        }
      }, 300);
    }
  }

  ngAfterContentInit(): void {
    const selected = this.selected;
    this.writeValue(selected && selected[this.valueKey()]);
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
          const params = parseFilterParams({ name: searchValue, ...this._customFilter }, this.queryParams, []);
          return this.service.getSearchData(path, params).pipe(finalize(() => (this.loading = false)));
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (scrolled) {
            this.dataSource = this.dataSource.concat(res.data);
            scrolled = false;
          } else {
            this.dataSource = res.data;
          }
          const selectedIndex = this.selectedIndex();
          if (selectedIndex) {
            this.selected = this.dataSource[selectedIndex];
          }
          if (this.selectedId() && this.dataSource.length) {
            this.selected = this.dataSource?.find(item => item.id === this.selectedId()) || this.selected;
          }
          const images = this.images();
          if (images && images.length) {
            this.setIcon();
          }
          this.pagination = res.meta?.pagination;
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      });
  }

  private searchItems(filterData: { [key: string]: any }): void {
    this.queryParams.page = 1;
    const params = parseFilterParams({ name: '', ...filterData }, this.queryParams, []);
    this.loading = true;
    if (this.pathSub && !this.pathSub.closed) {
      this.pathSub.unsubscribe();
    }
    this.pathSub = this.service
      .getSearchData(this.path(), params)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.data) {
          this.dataSource = res.data;
          this.pagination = res.meta?.pagination;
        }
      });
  }

  private setQueryParams(params: ParamMap): void {
    let selectedList = null;
    const path = this.path();
    if (path.includes(env.api.poses) && params.getAll('posId').length) {
      selectedList = params.getAll('posId').filter(item => item?.toString().trim());
    } else if (path.includes(env.api.merchants) && params.getAll('merchantId').length) {
      selectedList = params.getAll('merchantId').filter(item => item?.toString().trim());
    }
    this.queryParams = {
      ...this.queryParams,
      selectedList: selectedList,
    };
  }
}
