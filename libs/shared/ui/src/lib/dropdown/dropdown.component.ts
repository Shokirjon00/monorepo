import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Input,
  input,
  OnDestroy,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AutocompleteService, FILTER_PARAMS_PARSER, MessageService } from '@eskhata/data-access';
import { ENVIRONMENT } from '@eskhata/environment';
import {
  ClickOutsideModule,
  DestroyableComponent,
  IFilterParams,
  InfiniteScrollDirective,
  IPaginate,
  IParam,
  isPhone,
  ToastEnum,
} from '@eskhata/util';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';

@Component({
  standalone: true,
  selector: 'em-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [AngularSvgIconModule, ReactiveFormsModule, InfiniteScrollDirective, ClickOutsideModule],
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
  private _selected: any;
  private _selectedInput: unknown;

  get selected(): any {
    return this._selected;
  }

  @Input() set selected(value: any) {
    this._selectedInput = value;
    const id = this.selectedId();
    const key = this.valueKey();
    const currentMatchesId = this._selected && id != null && (id as unknown) !== '' && this._selected[key] === id;
    if (currentMatchesId && (!value || value[key] !== id)) return;
    this._selected = value;
  }

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
  /** Prefix for the generated element ids (client used these as test hooks). */
  readonly uniqueId = input<string>('');
  /** admin debounced the search at 150ms, client at 500ms — configurable so both keep their feel. */
  readonly searchDebounce = input<number>(150);

  readonly changed = output<any>();
  readonly clearInput = output<void>();

  loading: boolean;
  open: boolean;
  searchField$ = new FormControl('');
  value: unknown;
  pagination: IPaginate;
  isMobile = isPhone();
  clearButtonId: string;

  private pathSub: Subscription;
  private _dataSource: any[];
  private _customFilter: IParam;
  private readonly service = inject(AutocompleteService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly env = inject(ENVIRONMENT);
  private readonly parseFilterParams = inject(FILTER_PARAMS_PARSER);

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
    this.syncSelectedFromId();
  }

  @Input() set customFilter(data: Record<string, unknown>) {
    this._customFilter = data;
    this.searchItems(data);
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroyed$)).subscribe(params => this.setQueryParams(params));

    const path = this.path();
    if (!path) return;
    this.searchData(path);
    if (this.selectedId()) {
      this.searchData(path);
    }
  }

  onScrolled(): void {
    this.queryParams.page++;
    this.searchData(this.path(), true);
  }

  onChange: (value: unknown) => void = () => {};

  onTouched: () => void = () => {};

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
      this.open = show && !this.open;
      if (this.open && this.canSearch()) {
        this.setTimeout(() => this.searchElem()?.nativeElement.focus(), 0);
      }
    }
  }

  onSelect(option: any): void {
    const valueKey = this.valueKey();
    this.changed.emit(option[valueKey]);
    this.onChange(option[valueKey]);
    this.onTouched();
    this.searchField$.setValue('', { emitEvent: true });
    this._selected = option;
    this.open = false;
  }

  setIcon(): void {
    this.dataSource.forEach((item, i) => (item.icon = this.images()[i]));
  }

  clear(e: Event): void {
    this._selected = null;
    this.clearInput.emit();
    e.stopPropagation();
  }

  getDropdownItemId(index: number): string {
    const baseId = this.uniqueId() || 'dropdown';
    this.clearButtonId = `${baseId}-clear`;
    return `${baseId}-item-${index}`;
  }

  writeValue(value: string): void {
    if (this.dataSource && value !== null && value !== undefined && value !== '') {
      this.setTimeout(() => {
        const found = (this.dataSource || []).find(item => item[this.valueKey()] === value);
        if (found) {
          this._selected = found;
          this.changed.emit(found);
        }
      }, 300);
    }
  }

  ngAfterContentInit(): void {
    const selected = this.selected;
    const value = selected && selected[this.valueKey()];
    if (value !== undefined && value !== null && value !== '') {
      this.writeValue(value);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private syncSelectedFromId(): void {
    const id = this.selectedId();
    if (id === undefined || id === null || (id as unknown) === '') return;
    if (!this._dataSource?.length) return;
    const key = this.valueKey();
    const found = this._dataSource.find(item => item[key] === id);
    if (found && found !== this._selected) this._selected = found;
  }

  private readonly _syncSelectedByIdEffect = effect(() => {
    const id = this.selectedId();
    if (id === undefined || id === null || (id as unknown) === '') {
      if (this._selectedInput !== undefined) this._selected = this._selectedInput;
      return;
    }
    this.syncSelectedFromId();
  });

  private searchData(path: string, scrolled: boolean = false): void {
    let value: string | null = '';
    if (this.pathSub) {
      this.pathSub.unsubscribe();
    }

    this.pathSub = this.searchField$.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(this.searchDebounce()),
        switchMap((searchValue: string | null) => {
          value = searchValue;
          this.loading = true;
          if (!scrolled) {
            this.queryParams.page = 1;
          }
          const params = this.parseFilterParams({ name: searchValue, ...this._customFilter }, this.queryParams, []);
          return this.service.getSearchData(path, params).pipe(finalize(() => (this.loading = false)));
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (scrolled) {
            this.dataSource = [...(this.dataSource ?? []), ...res.data];
          } else {
            this.dataSource = res.data;
          }
          const selectedIndex = this.selectedIndex();
          if (selectedIndex) {
            this._selected = this.dataSource[selectedIndex];
          }
          if (this.selectedId() && this.dataSource.length) {
            this._selected = this.dataSource?.find(item => item.id === this.selectedId()) || this._selected;
          }
          const images = this.images();
          if (images && images.length) {
            this.setIcon();
          }
          this.pagination = res.meta?.pagination;
          this.cdr.detectChanges();
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      });
  }

  private searchItems(filterData: Record<string, unknown>): void {
    this.queryParams.page = 1;
    const params = this.parseFilterParams({ name: '', ...filterData }, this.queryParams, []);
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
        if (res.status || res.data) {
          this.dataSource = res.data;
          this.pagination = res.meta?.pagination;
        }
      });
  }

  /** client narrowed the pos/merchant lists from the route; harmless in admin where those params are absent. */
  private setQueryParams(params: ParamMap): void {
    let selectedList = null;
    const path = this.path();
    if (!path) return;
    if (path.includes(this.env.api.poses) && params.getAll('posId').length) {
      selectedList = params.getAll('posId').filter(item => item?.toString().trim());
    } else if (path.includes(this.env.api.merchants) && params.getAll('merchantId').length) {
      selectedList = params.getAll('merchantId').filter(item => item?.toString().trim());
    }
    this.queryParams = {
      ...this.queryParams,
      selectedList: selectedList,
    };
  }
}
