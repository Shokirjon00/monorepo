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
import { AutocompleteService } from '@core/services/autocomplete.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute } from '@angular/router';
import { isGuid } from '@core/utils/is-guid';
import { parseFilterParams } from '@core/utils/filter-util';
import { ErrorStatusCodeEnum } from '@eskhata/util';
import { IStatusSelect } from '@core/interfaces/status-select.interface';
import { ActiveSelect } from '@eskhata/util';
import { SharedModule } from '@shared/shared.module';
import { SelectTriggerModule } from '@core/directives/selec-trigger/select-trigger.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutocompleteCoordinatorService } from "@core/services/autocomplete-coordinator.service";

type AutocompleteItem = Record<string, unknown>;

@Component({
  standalone: true,
  selector: 'em-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  imports: [
    ReactiveFormsModule,
    SharedModule,
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
  private readonly instanceId = Symbol('autocomplete');
  readonly activatedRoute = inject(ActivatedRoute);
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
      .subscribe(res => this.dataSource = this.dataSource.concat(res.data));
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
    this.ensureStaticData();
    if (this.dataSource?.length) {
      this.setOpen(!this.isOpenDropdown());
    }
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
        this.dataSource = res.data;
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
          const params = parseFilterParams(filterParams, this.queryParams, []);

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
    const params = parseFilterParams(
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
