import {
  AfterContentInit,
  Component,
  forwardRef,
  Input,
  OnInit,
  input,
  inject, output,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';

import { SelectTriggerModule } from '@core/directives/selec-trigger/select-trigger.module';
import { debounceTime, Subscription, takeUntil } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { IFilterParams, IPaginate } from '@core/interfaces';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { isGuid } from '@core/utils/is-guid';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { DataSourceService } from '@core/services/data-source.service';
import { ISource } from '@core/interfaces/source';

@Component({
  standalone: true,
  selector: 'em-select-field-search',
  templateUrl: './select-field-search.component.html',
  styleUrls: ['./select-field-search.component.scss'],
  imports: [SvgIconComponent, ClickOutsideModule, ReactiveFormsModule, FormsModule, SelectTriggerModule, SharedModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFieldSearchComponent),
      multi: true,
    },
  ],
})
export class SelectFieldSearchComponent
  extends DestroyableComponent
  implements ControlValueAccessor, AfterContentInit, OnInit
{
  selected = input<any>();
  readonly sendRequestImmediately = input.required<boolean>();
  readonly apiUrl = input.required<string>();
  readonly optionValue = input<string>();
  readonly optionLabel = input<string>('name');
  readonly type = input<string>();
  readonly showClear = input<boolean>(true);
  readonly inDisabled = input<boolean>(true);
  readonly placeholder = input<string>('');
  readonly changed = output<any>();
  readonly selectedItem = output();

  filteredItems: any[] = [];
  searchControl = new FormControl('');
  isOpenDropdown: boolean = false;
  items: any[] = [];

  pagination: IPaginate;
  loading: boolean = false;
  private isSelectingItem: boolean = false;
  private isSearching: boolean = false;
  private _dataSource: any[];
  private requestSub: Subscription;
  private readonly dataSourceService = inject(DataSourceService);
  private readonly route = inject(ActivatedRoute);

  queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 50,
    selectedList: '',
    filters: '',
  };

  get dataSource(): any[] {
    return this._dataSource;
  }

  @Input() set dataSource(value: any[]) {
    this._dataSource = value;
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      const apiUrl = this.apiUrl();
      if (
        apiUrl.includes('payment_sync_statuses') ||
        apiUrl.includes('payment_statuses') ||
        apiUrl.includes('gateways')
      ) {
        return;
      }
      const idParams = this.extractIdParams(params);
      this.queryParams.selectedList = this.getSelectedList(idParams);
      this.getDataSource();
    });
    this.handleSearchValueChanges();
  }

  handleSearchValueChanges(): void {
    this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(value => {
      if (this.isSelectingItem) {
        this.isSelectingItem = false;
        return;
      }
      this.queryParams.filters = value ? `name@=*${value}` : '';
      this.queryParams.page = 1;
      this.isSearching = true;
      this.getDataSource();
    });
  }

  clearValue(e: Event): void {
    this.selected = null;
    this.searchControl.setValue('');
    this.queryParams.filters = '';
    this.queryParams.page = 1;
    this.isSearching = false;
    this.filteredItems = [...this.items];
    this.changed.emit(null);
    this.onChange(null);
    e.stopPropagation();
    this.getDataSource();
  }

  onSelect(option: any): void {
    this.selected = option;
    this.changed.emit(option);
    this.onChange(option[this.optionValue()]);
    this.selectedItem.emit(option);
    this.isOpenDropdown = false;
    this.queryParams.page = 1;
    this.queryParams.selectedList = option.id || '';
    this.isSelectingItem = true;
    this.searchControl.setValue('');
    if (this.sendRequestImmediately()) {
      this.getDataSource();
    }
  }

  onChange = (_: any): void => {};
  onTouched = (): void => {};

  writeValue(value: string): void {
    if (isGuid(value) && this.items && value !== null) {
      this.setTimeout(() => {
        this.selected = (this.items || []).find(item => item[this.optionValue()] === value);
        const selected = this.selected();
        if (selected) {
          this.changed.emit(selected);
        }
      }, 300);
    }
  }

  ngAfterContentInit(): void {
    if (this.apiUrl()) {
      this.getDataSource();
    }
    const selected = this.selected();
    this.writeValue(selected && selected[this.optionValue()]);
    this.updateSelectedItem();
    this.filteredItems = [...this.items];
  }

  registerOnChange(fn: (_: any) => object): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => object): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  onScrolled(): void {
    if (!this.loading && this.pagination?.hasNextPage && !this.isSearching) {
      this.queryParams.page += 1;
      this.getDataSource(true);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  private extractIdParams(params: { [key: string]: string }): { key: string; value: string }[] {
    return Object.entries(params)
      .filter(([key, _]) => key.toLowerCase().endsWith('id'))
      .map(([key, value]) => ({ key, value }));
  }

  private getSelectedList(idParams: { key: string; value: string }[]): string {
    const mapping: { [key: string]: string } = {
      companies: 'companyId',
      merchants: 'merchantId',
      poses: 'posId',
      services: 'serviceId',
      banks: 'bankAcquirerId',
    };
    for (const [key, paramKey] of Object.entries(mapping)) {
      if (this.apiUrl().includes(key)) {
        return idParams
          .filter(param => param.key === paramKey)
          .map(param => param.value)
          .join(',');
      }
    }
    return idParams.map(param => param.value).join(',');
  }

  private updateSelectedItem(): void {
    if (this.selected() && this.optionValue()) {
      const matchedItem = this.items.find(item => item[this.optionValue()] === this.selected()[this.optionValue()]);
      if (matchedItem) {
        this.selected = matchedItem;
      }
    }
  }

  private getDataSource(scrolled: boolean = false): void {
    const apiUrl = this.apiUrl();
    if (apiUrl) {
      this.loading = true;
      if (this.requestSub && !this.requestSub.closed) {
        this.requestSub.unsubscribe();
      }
      const source: ISource = { method: 'get', link: apiUrl };
      this.requestSub = this.dataSourceService
        .getSource(source, { ...this.queryParams })
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          if (res.status) {
            this.items = scrolled ? this.items.concat(res.data) : res.data;
            this.filteredItems = [...this.items];
            this.pagination = res.meta?.pagination;
            this.updateSelectedItem();
            this.loading = false;
          }
        });
    }
  }
}
