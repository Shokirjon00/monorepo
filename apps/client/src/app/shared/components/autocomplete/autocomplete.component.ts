import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Injector,
  INJECTOR,
  Input,
  OnInit,
  Output,
  Type,
  input,
  inject,
  DestroyRef, output,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AutocompleteService } from '@core/services/autocomplete.service';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { isGuid } from '@core/utils/is-guid';
import { parseFilterParams } from '@core/utils/filter-util';
import { ErrorStatusCodeEnum } from '@core/enums/error-status-codes.enum';
import { IStatusSelect } from '@core/interfaces/status-select.interface';
import { ActiveSelect } from '@core/enums/active-select';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { isPhone } from '@core/helper';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { SharedModule } from '@shared/shared.module';
import { SvgIconComponent } from 'angular-svg-icon';
import { SelectTriggerModule } from '@core/directives/selec-trigger/select-trigger.module';

import { ISelect } from '@core/interfaces/select.interface';
import { IParam } from '@core/interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'em-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  imports: [ReactiveFormsModule, ClickOutsideModule, SharedModule, SelectTriggerModule, SvgIconComponent],
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
  readonly path = input<string>();
  readonly maxHeight = input<string>('340px');
  readonly show = input<boolean>(true);
  readonly selectWithOutSearch = input<boolean>(false);
  readonly isBottomSheet = input<boolean>(false);
  readonly changed = output<string>();
  pagination: IPaginate;
  searchField$ = new FormControl('');
  selected: any;
  loading: boolean;
  isOpenDropdown: boolean = false;
  dataSource: any[];
  control: AbstractControl;
  isSelectedItem: boolean = false;
  isMobile = isPhone();

  private _customFilter: { [key: string]: any };
  private service = inject(AutocompleteService);
  private activatedRoute = inject(ActivatedRoute);
  private bottomSheet = inject(MatBottomSheet);
  private injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    pageSize: 15,
  };

  onChange: any = () => {};
  onTouched: any = () => {};

  @Input() set customFilter(data: { [key: string]: any }) {
    this._customFilter = data;
    const value = Object.keys(data);
    if (this._customFilter[value[0]]) {
      this.searchItems(data);
    }
  }

  get items(): ISelect[] {
    return this.selected ? [this.selected] : this.dataSource;
  }

  ngAfterViewInit(): void {
    this.setTimeout(() => {
      const ngControl = this.injector.get(NgControl);
      this.control = ngControl.control;
    }, 100);
  }

  ngOnInit(): void {
    this.searchData(this.path());
  }

  writeValue(value: string): void {
    if (value === '' || value === null) {
      this.clear();
      return;
    }
    let params: any = {};
    if (isGuid(value)) {
      params['filters=id='] = value;
    }
    this.loading = true;
    this.service
      .getSearchData(this.path(), params)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.dataSource = res.data.map((item: any) => this.normalize(item));
          const selectedItem = this.dataSource?.find(item => item[this.optionValue()] === value);
          if (selectedItem) {
            this.onSelect(selectedItem);
          }
        }
      });
  }

  private normalize(item: any): any {
    return {
      id: item.id,
      name: item.number || item.name || '',
      ...item,
    };
  }

  toggle(): void {
    if (this.isMobile && this.isBottomSheet()) {
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
    } else {
      this.isOpenDropdown = !!this.dataSource;
    }
  }

  onScrolled(): void {
    this.queryParams.page += 1;
    this.service
      .getSearchData(this.path(), this.queryParams)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.dataSource = [...this.dataSource, ...res.data.map((item: any) => this.normalize(item))];
      });
  }

  clear(): void {
    this.searchField$.setValue('');
    this.changed.emit('');
    this.onChange(null);
    this.selected = null;
    this.dataSource = [];
    this.searchData(this.path());
  }

  valueChange(evt: IStatusSelect): void {
    if (evt.type === ActiveSelect.active) {
      this.dataSource[evt.itemIndex].selected = true;
    } else if (evt.type === ActiveSelect.deactive) {
      this.dataSource[evt.itemIndex].selected = false;
    } else if (evt.type === ActiveSelect.selected) {
      this.onSelect(this.dataSource[evt.itemIndex]);
    }
  }

  onSelect(option: any, emitEvent = true): void {
    if (this.selectWithOutSearch()) {
      this.isSelectedItem = true;
    }
    const optionValue = this.optionValue();
    this.onChange(option[optionValue]);
    this.onTouched();
    this.selected = option;
    this.searchField$.setValue(option[this.optionLabel()], { emitEvent });
    this.isOpenDropdown = false;
    this.changed.emit(this.selected[optionValue]);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  close(event: Event): void {
    this.isOpenDropdown = !this.isOpenDropdown;
    event.stopPropagation();
  }

  private searchData(path: string, scrolled: boolean = false): void {
    this.searchField$.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(500),
        switchMap((searchValue: string) => {
          if (this.selectWithOutSearch() && this.isSelectedItem) {
            searchValue = '';
            this.isSelectedItem = false;
          }
          const value = 'name@=*' + searchValue;
          this.loading = true;
          if (!scrolled) this.queryParams.page = 1;
          this.queryParams.filters = value;
          const params = parseFilterParams({ name: searchValue, ...this._customFilter }, this.queryParams, []);
          return this.service.getSearchData(path, params).pipe(finalize(() => (this.loading = false)));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.dataSource = scrolled
            ? this.dataSource.concat(res.data.map((item: any) => this.normalize(item)))
            : res.data.map((item: any) => this.normalize(item));
          this.pagination = res.meta?.pagination;
        } else if (res.errorCode === ErrorStatusCodeEnum.FORBIDDEN) {
          this.control.setErrors({ notPermission: true, ...this.control.errors });
        }
      });
  }

  private searchItems(filterData: { [key: string]: any }): void {
    const params = parseFilterParams({ name: '', ...filterData }, this.queryParams, []);
    this.loading = true;
    this.service
      .getSearchData(this.path(), params)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.dataSource = res.data.map((item: any) => this.normalize(item));
      });
  }
}
