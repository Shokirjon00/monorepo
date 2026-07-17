import { AfterContentInit, ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, input, viewChild, inject } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AutocompleteService } from '@core/services/autocomplete.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { parseFilterParams } from '@core/utils/filter-util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate, ToastEnum } from '@eskhata/util';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@core/services/message.service';
import { IParam } from '@core/interfaces/param.interface';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { isPhone } from "@core/helper";
import { BottomSheetComponent } from "@shared/components/bottom-sheet/bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";

@Component({
  standalone: true,
  selector: 'em-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [
    AngularSvgIconModule,
    ReactiveFormsModule,
    SharedModule,
    ClickOutsideModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent extends DestroyableComponent implements OnInit, AfterContentInit, OnDestroy {
  readonly searchElem = viewChild<ElementRef>('searchElem');
  private _selected: any;
  private _selectedInput: unknown;
  get selected(): any { return this._selected; }
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
  @Output() changed: EventEmitter<any> =  this.register(new EventEmitter());
  @Output() clearInput: EventEmitter<any> = this.register(new EventEmitter());
  loading: boolean;
  open: boolean;
  searchField$ = new FormControl('');
  value: unknown;

  pagination: IPaginate;
  isMobile = isPhone();

  private _dataSource: any[];
  private _customFilter: IParam;
  private readonly service = inject(AutocompleteService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly bottomSheet = inject(MatBottomSheet);

  queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    filters: '',
    pageSize: 15
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
    const path = this.path();
    if (!path) return;
    this.searchData(path);
    if (this.selectedId()) {
      this.searchData(path);
    }
  }

  onScrolled(): void {
    this.queryParams.page += 1;
    this.searchData(this.path(), true);
  }

  onChange: (value: unknown) => void = () => {};

  onTouched: () => void = () => {};

  toggle(): void {
    const show = this.show();
    if (show && this.isMobile && this.isBottomSheet()) {
      this.bottomSheet.open(BottomSheetComponent, {
        panelClass: 'bottom-sheet',
        data: {
          dataSource: this.dataSource,
          selected: this.selected,
          canSearch: this.canSearch(),
          searchPlaceholder: this.searchPlaceholder(),
          path: this.path(),
          customFilters: this._customFilter,
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
    this.searchField$.setValue('', {emitEvent: true});
    this._selected = option;
    this.open = false;
  }

  setIcon(): void {
    this.dataSource.forEach((item, i) => item.icon = this.images()[i]);
  }

  clear(e: Event): void {
    this._selected = null;
    this.clearInput.emit();
    e.stopPropagation();
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
    this.searchField$.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(150),
        switchMap((searchValue: string | null) => {
          value = searchValue;
          this.loading = true;
          if (!scrolled) {
            this.queryParams.page = 1
          }
          const params = parseFilterParams({name: searchValue, ...this._customFilter}, this.queryParams, []);
          return this.service.getSearchData(path, params)
            .pipe(finalize(() => this.loading = false));
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
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
        }
      });
  }

  private searchItems(filterData: Record<string, unknown>): void {
    this.queryParams.page = 1;
    const params = parseFilterParams({name: '', ...filterData}, this.queryParams, []);
    this.loading = true;
    this.service.getSearchData(this.path(), params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.dataSource = res.data;
          this.pagination = res.meta?.pagination;
        }
    });
  }
}
