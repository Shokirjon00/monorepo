import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  INJECTOR,
  Input,
  OnInit,
  Output,
  signal,
  WritableSignal,
  input,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';
import { AutocompleteCoordinatorService, AutocompleteService, FILTER_PARAMS_PARSER } from '@eskhata/data-access';
import { DestroyableComponent, InfiniteScrollDirective, isPhone } from '@eskhata/util';
import { IPaginate, ErrorStatusCodeEnum, IStatusSelect, ActiveSelect } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { isGuid } from '@eskhata/util';
import { SelectTriggerModule } from '@eskhata/util';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@eskhata/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type AutocompleteItem = Record<string, unknown>;

@Component({
  standalone: true,
  selector: 'em-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  imports: [
    ReactiveFormsModule,
    InfiniteScrollDirective,
    ClickOutsideModule,
    SelectTriggerModule,
    AngularSvgIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: AutocompleteComponent,
    },
  ],
})
export class AutocompleteComponent extends DestroyableComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  readonly placeholder = input<string>();
  readonly searchable = input<boolean>();
  readonly optionLabel = input('name');
  readonly optionValue = input('id');
  readonly staticData = input<readonly AutocompleteItem[] | null>(null);
  readonly path = input<string>();
  readonly maxHeight = input<string>('340px');
  readonly show = input<boolean>(true);
  readonly selectWithOutSearch = input<boolean>(false);
  readonly isBottomSheet = input<boolean>(false);
  readonly useNewFilterFormat = input<boolean>(false);
  @Output() changed = this.register(new EventEmitter());

  pagination: IPaginate;
  searchField$ = new FormControl('');
  selected: AutocompleteItem | null = null;
  dataSource: AutocompleteItem[] = [];
  control: AbstractControl;

  readonly disabled: WritableSignal<boolean> = signal(false)
  readonly isOpenDropdown: WritableSignal<boolean> = signal(false);
  readonly loading: WritableSignal<boolean> = signal(false);
  private readonly isSelectedItem: WritableSignal<boolean> = signal(false);
  private readonly isSearchDataInitialized: WritableSignal<boolean> = signal(false);
  private readonly coordinator = inject(AutocompleteCoordinatorService);
  private readonly parseFilterParams = inject(FILTER_PARAMS_PARSER);
  private readonly instanceId = Symbol('autocomplete');
  readonly activatedRoute = inject(ActivatedRoute);
  readonly isMobile = isPhone();
  private readonly bottomSheet = inject(MatBottomSheet);
  private _customFilter: { [key: string]: any };
  private readonly injector = inject(INJECTOR);
  private readonly service = inject(AutocompleteService);
  private readonly destroyRef = inject(DestroyRef);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    pageSize: 50
  };

  get items(): AutocompleteItem[] {
    return this.selected ? [this.selected] : this.dataSource;
  }

  @Input() set customFilter(data: { [key: string]: any }) {
    this._customFilter = data;
    const value = Object.keys(data);
    if (this._customFilter[value[0]]) {
      this.searchItems(data);
    }
  }

  ngAfterViewInit(): void {
    this.setTimeout(() => {
      const ngControl = this.injector.get(NgControl);
      this.control = ngControl.control;
    }, 100);
  }

  ngOnInit(): void {
    this.listenToCoordinator();
    if (this.staticData()) {
      this.initStaticData();
    } else {
      this.searchData(this.path());
    }
  }

  onChange = (_: any): void => {
  };
  onTouched = (): void => {
  };

  writeValue(value: string): void {
    if (value === '' || value === null) {
      this.resetValue();
      return;
    }
    if (this.staticData()) {
      this.selectFromStaticData(value);
      return;
    }
    this.selectFromRemote(value);
  }

  onScrolled(): void {
    if (this.staticData()) return;
    this.queryParams.page += 1;
    this.service
      .getSearchData(this.path(), this.queryParams)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => this.dataSource = this.dataSource.concat(res.data.map((item: AutocompleteItem) => this.normalize(item))));
  }

  clear(): void {
    this.searchField$.setValue('');
    this.changed.emit('');
    this.onChange(null);
    this.selected = null;

    if (this.staticData()) {
      this.dataSource = [...(this.staticData() ?? [])];
    } else {
      this.dataSource = [];
    }
  }

  valueChange(evt: IStatusSelect): void {
    const item = this.dataSource[evt.itemIndex];
    if (evt.type === ActiveSelect.active) {
      item['selected'] = true;
    } else if (evt.type === ActiveSelect.deactive) {
      item['selected'] = false;
    } else if (evt.type === ActiveSelect.selected) {
      this.onSelect(item);
    }
  }

  onSelect(option: AutocompleteItem, emitEvent = true): void {
    if (this.selectWithOutSearch()) {
      this.isSelectedItem.set(true);
    }
    const optionValue = this.optionValue();
    this.onChange(option[optionValue]);
    this.onTouched();
    this.selected = option;
    const labelKey = this.optionLabel();
    const displayLabel =
      option && (option[labelKey] ?? option['fullName'] ?? option['name'] ?? '');
    this.searchField$.setValue(String(displayLabel), { emitEvent });
    this.isOpenDropdown.set(false);
    this.changed.emit(this.selected[optionValue]);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  openDropdown(): void {
    if (this.disabled()) return;
    this.ensureStaticData();
    if (this.dataSource?.length) {
      this.setOpen(true);
    }
  }

  handleContainerClick(event: Event): void {
    if (this.disabled()) return;
    if (this.isMobile && this.isBottomSheet()) {
      this.openBottomSheet();
      return;
    }
    this.ensureStaticData();
    if (this.dataSource?.length) {
      this.setOpen(!this.isOpenDropdown());
    }
  }

  openBottomSheet(): void {
    this.bottomSheet
      .open(BottomSheetComponent, {
        panelClass: 'bottom-sheet',
        data: {
          dataSource: this.dataSource,
          selected: this.selected,
          canSearch: this.searchable(),
          path: this.path(),
          searchPlaceholder: this.placeholder(),
          customFilters: this._customFilter,
        },
      })
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(option => option && this.onSelect(option));
  }

  handleArrowClick(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.ensureStaticData();
    if (this.dataSource?.length) {
      this.setOpen(!this.isOpenDropdown());
    }
  }

  handleClearClick(event: Event): void {
    event.stopPropagation();
    this.clear();
  }

/** client's sources label rows by `number`; falling back keeps those readable without touching rows that already carry a name. */
  private normalize(item: AutocompleteItem): AutocompleteItem {
    return { name: item['number'] ?? item['name'] ?? '', ...item };
  }

  private listenToCoordinator(): void {
    this.coordinator.opened$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(openedId => {
        if (openedId !== this.instanceId && this.isOpenDropdown()) {
          this.isOpenDropdown.set(false);
        }
      });
  }

  private resetValue(): void {
    if (!this.isSearchDataInitialized()) {
      this.selected = null;
      this.dataSource = [];
      return;
    }
    this.clear();
  }

  private selectFromStaticData(value: string): void {
    this.dataSource = [...(this.staticData() ?? [])];
    const selectedItem = this.dataSource.find(
      item => item[this.optionValue()] === value,
    );
    if (selectedItem) {
      this.onSelect(selectedItem, false);
    }
  }

  private selectFromRemote(value: string): void {
    const params: Record<string, string> = {};
    if (isGuid(value)) {
      if (this.useNewFilterFormat()) {
        params['filters'] = `id==${value}`;
      } else {
        params['filters=id='] = value;
      }
    }
    this.loading.set(true);
    this.service
      .getSearchData(this.path(), params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        if (!res.status) return;
        this.dataSource = res.data.map((item: AutocompleteItem) => this.normalize(item));
        const selectedItem = this.dataSource?.find(
          item => item[this.optionValue()] === value,
        );
        if (selectedItem) {
          this.onSelect(selectedItem);
          return;
        }
        const altSelected = this.dataSource?.find(
          item => item['fullName'] === value || item['name'] === value,
        );
        if (altSelected) {
          this.onSelect(altSelected);
        }
      });
  }

  private ensureStaticData(): void {
    if (this.staticData() && (!this.dataSource || !this.dataSource.length)) {
      this.dataSource = [...(this.staticData() ?? [])];
    }
  }

  private initStaticData(): void {
    if (this.isSearchDataInitialized()) return;
    this.isSearchDataInitialized.set(true);

    this.dataSource = [...(this.staticData() ?? [])];

    this.listenToStaticSearch();
  }

  private listenToStaticSearch(): void {
    let isFirstEmit = true;

    this.searchField$.valueChanges
      .pipe(
        startWith(''),
        debounceTime(150),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((searchValue: string) => {
        if (isFirstEmit) {
          isFirstEmit = false;
          return;
        }

        if (!searchValue) {
          this.selected = null;
          this.onChange(null);
          this.changed.emit('');
        }

        if (this.selectWithOutSearch() && this.isSelectedItem()) {
          searchValue = '';
          this.isSelectedItem.set(false);
        }

        const term = (searchValue ?? '').toString().toLowerCase().trim();
        const labelKey = this.optionLabel();
        const fresh = this.staticData() ?? [];

        this.dataSource = term
          ? fresh.filter(item => {
            const label = (
              item[labelKey] ??
              item['name'] ??
              item['fullName'] ??
              ''
            )
              .toString()
              .toLowerCase();
            return label.includes(term);
          })
          : [...fresh];
      });
  }

  private searchData(path: string): void {
    if (this.isSearchDataInitialized()) {
      return;
    }
    this.isSearchDataInitialized.set(true);
    this.searchField$.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          if (!searchValue) {
            this.selected = null;
            this.onChange(null);
            this.changed.emit('');
          }

          if (this.selectWithOutSearch() && this.isSelectedItem()) {
            searchValue = '';
            this._customFilter = null;
            this.isSelectedItem.set(false);
          }

          const filters = this.useNewFilterFormat()
            ? `name@=${searchValue}|fullName@=${searchValue}`
            : `name=@*${searchValue}|fullName=@*${searchValue}`;

          this.queryParams.page = 1;
          this.queryParams.filters = filters;

          const filterParams = { name: searchValue, ...(this._customFilter || {}) };
          const params = this.parseFilterParams(filterParams, this.queryParams, []);

          this.loading.set(true);
          return this.service.getSearchData(path, params).pipe(
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        if (res.status) {
          this.dataSource = res.data;
          this.pagination = res.meta?.pagination;
        } else if (res.errorCode === ErrorStatusCodeEnum.FORBIDDEN && this.control) {
          this.control.setErrors({ notPermission: true, ...(this.control.errors || {}) });
        }
      });
  }

  private searchItems(filterData: { [key: string]: any }): void {
    const params = this.parseFilterParams(
      { name: '', ...filterData, ...this._customFilter },
      this.queryParams,
      [],
    );
    this.loading.set(true);
    const path = this.path();
    if (path) {
      this.service
        .getSearchData(path, params)
        .pipe(
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(res => this.dataSource = res.data);
    }
  }

  private setOpen(open: boolean): void {
    this.isOpenDropdown.set(open);
    if (open) {
      this.coordinator.notifyOpened(this.instanceId);
    }
  }
}
