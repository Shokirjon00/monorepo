import {DatePipe} from '@angular/common';
import {DestroyableComponent} from './destroyable.component';
import {IParam} from '../interfaces/param.interface';
import {DateFormatEnum} from '../enums/date-format.enum';
import {DestroyRef, Directive, inject, Input, OnDestroy} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {debounceTime} from "rxjs/operators";
import {first, Subject} from "rxjs";
import {getFromLocalStorage, removeFilterFromStorage, setToLocalStorage} from '../utils/storage';
import {StatusTypeConstants} from '../constants/status-type.constants';
import {IFilterItem} from '../interfaces/filter-item.interface';
import {ICaption} from '../interfaces/table.interface';
import {DateService} from '../services/date.service';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Directive()
export abstract class BaseFilterComponent extends DestroyableComponent implements OnDestroy {
  @Input() defaultFilterField: string = 'name';
  protected filterItems: Partial<IFilterItem>[] = [];
  protected fields: Partial<IFilterItem>[] | any;
  protected params: Params | any = {};
  protected modelSubject: Subject<any> = new Subject<any>();
  protected _fieldsMap: IParam = {};
  protected _filterFields: ICaption[] = [];
  protected _key: string;

  protected refundApplicationStatus = StatusTypeConstants.refundApplicationStatus;
  protected sendType = StatusTypeConstants.sendType;
  protected terminalStatusId = StatusTypeConstants.terminalStatus;
  protected refundType = StatusTypeConstants.refundType;
  protected actionType = StatusTypeConstants.type;
  protected activeStatus = StatusTypeConstants.statuses;

  protected readonly datePipe = inject(DatePipe);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly dateService = inject(DateService);

  @Input() set key(value: string) {
    if (value && value !== this._key) {
      this._key = value;
      this.filterItems = [];
      this.params = {};
    }
  }

  @Input() set filterFields(value: ICaption[]) {
    this._filterFields = (value || [])
      .filter(item => item.field && !item.isFiltered)
      .map(item => ({ ...item }));

    this.initFilterFields(this._filterFields);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this._key) {
      const keys = Object.keys(this.params || {});
      const meaningfulKeys = keys.filter(k => !['page', 'pageSize', 'module'].includes(k));
      if (meaningfulKeys.length > 0) {
        this.saveFilterToStorage(this.params);
      }
    }
  }

  protected parseRouteParams(params: IParam): void {
    this.filterItems = [];
    for (const paramKey in params) {
      if (this._fieldsMap[paramKey]) {
        const field = { ...this._fieldsMap[paramKey] };
        if (field.filterType === 'date') {
          const [start, end] = (params[paramKey] || ' ').split(' ');
          field.startDate = start || null;
          field.endDate = end || null;
        } else {
          field.value = params[paramKey];
        }
        this.filterItems.push(field);
      }
    }
  }

  protected clearFilter(): void {
    this.filterItems = [];
    this.params = {};
    removeFilterFromStorage(this._key);
    this.reloadPage();
  }

  protected addFilterLabel(): void {
    const unselectedFields = this.getUnSelectedFields();
    if (unselectedFields.length > 0) {
      const field = this.pickField(unselectedFields);
      if (field.filterType === 'date') {
        this.setDefaultDate(field);
      } else {
        field.value = null;
      }
      this.filterItems.push(field);
    }
  }

  protected pickField(fields: any[]): any {
    return fields.length > 0 ? fields[0] : null;
  }

  protected initFilterFields(captions: ICaption[]): void {
    this._fieldsMap = {};

    captions.forEach(item => {
      const mapKey = item.filterParams || item.field;
      if (mapKey) this._fieldsMap[mapKey] = { ...item };
    });

    this.route.queryParams.pipe(first()).subscribe(queryParams => {

      let stored: any = null;
      if (this._key) {
        const rawStored = getFromLocalStorage(this._key);
        if (rawStored) {
          stored = { ...rawStored };
          if (stored._timestamp) {
            delete stored._timestamp;
          }
        }
      }

      const urlFilterKeys = Object.keys(queryParams).filter(key => !['page', 'pageSize'].includes(key));
      const hasUrlFilters = urlFilterKeys.length > 0;

      if (hasUrlFilters) {
        this.params = { ...queryParams };
      } else if (stored) {
        this.params = { ...stored, ...queryParams };
      } else {
        this.params = { ...queryParams };
      }

      this.parseRouteParams(this.params);

      this.params['page'] = queryParams['page'] || this.params['page'] || 1;
      this.params['pageSize'] = queryParams['pageSize'] || this.params['pageSize'] || 15;

      this.applyParamsAndReload();
    });

    this.listenToQueryParamsChanges();
    this.setDefaultFilterFields();
  }

  protected applyParamsAndReload(): void {
    this.saveFilterToStorage(this.params);
    this.reloadPage();
  }

  protected saveFilterToStorage(queryParams: Params): void {
    if (!this._key) return;

    const toSave = { ...queryParams, _timestamp: Date.now() };
    setToLocalStorage(this._key, toSave);
  }

  protected reloadPage(): void {
    const cleanParams: any = {};
    Object.keys(this.params).forEach(key => {
      const value = this.params[key];
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        cleanParams[key] = value;
      }
    });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cleanParams,
      queryParamsHandling: '',
      replaceUrl: true
    }).catch();
  }

  protected removeField(index: number, key: string): void {
    const filterItem = this.filterItems[index];
    if (!filterItem) return;
    const paramKey = filterItem.filterParams || filterItem.field;
    delete this.params[paramKey];
    if (filterItem.filterParams && filterItem.filterParams !== key) {
      delete this.params[filterItem.filterParams];
    }
    this.filterItems.splice(index, 1);
    this.applyParamsAndReload();
  }

  protected clearInput(filterItem: Partial<IFilterItem>): void {
    const paramKey = filterItem.filterParams || filterItem.field;
    filterItem.value = null;
    if (filterItem.filterType === 'date') {
      filterItem.startDate = null;
      filterItem.endDate = null;
    }
    if (this.params[paramKey] !== undefined) {
      delete this.params[paramKey];
    }
    this.applyParamsAndReload();
  }

  protected onFilterChange(filterItem: Partial<IFilterItem>): void {
    const paramKey = filterItem.filterParams || filterItem.field;

    if (filterItem.filterType === 'date') {
      const startDate = this.datePipe.transform(filterItem.startDate || this.dateService.getDefaultStartDate(), DateFormatEnum.YEAR_DATE_TIME_FORMAT);
      const endDate = this.datePipe.transform(filterItem.endDate || this.dateService.getDefaultEndDate(), DateFormatEnum.YEAR_DATE_TIME_FORMAT);
      this.params[paramKey] = `${startDate} ${endDate}`;
    } else {
      if (filterItem.value) {
        this.params[paramKey] = filterItem.value;
      } else {
        delete this.params[paramKey];
      }
    }

    this.params['page'] = 1;
    this.applyParamsAndReload();
  }

  protected selectListItem(key: string, value: string): void {
    if (value) {
      this.params[key] = value;
    } else {
      delete this.params[key];
    }
    this.applyParamsAndReload();
  }

  protected selectStatusType(field: { key: string, id: string }): void {
    if (field?.id) {
      this.params['paymentStatusGroupId'] = field.id;
    } else {
      delete this.params['paymentStatusGroupId'];
    }
    this.applyParamsAndReload();
  }
  protected searchDropdown(field: { key: string, id: string }, filterParams: string, placeholder: string): void {
    if (field?.id) {
      this.params[filterParams] = field.id;
    } else {
      delete this.params[filterParams];
    }
    this.applyParamsAndReload();
  }

  protected listenToQueryParamsChanges(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const urlFilterKeys = Object.keys(params || {}).filter(key => !['page', 'pageSize'].includes(key));
        if (urlFilterKeys.length > 0) {
          this.params = { ...params };
        }
      });
  }

  protected setDefaultFilterFields(): void {
    if (this.filterItems.length > 0) return;

    let defaultField = this._fieldsMap[this.defaultFilterField];
    if (!defaultField && this._filterFields.length > 0) {
      defaultField = this._filterFields[0];
    }

    if (defaultField) {
      if (defaultField.filterType === 'date') {
        this.setDefaultDate(defaultField);
      }
      this.filterItems.push(defaultField);
      this.onFilterChange(defaultField);
    }
  }

  protected getUnSelectedFields(): Partial<IFilterItem>[] {
    const usedFields = this.filterItems.map(item => item.field);
    return this._filterFields.filter(item => !usedFields.includes(item.field));
  }

  protected setDefaultDate(filterItem: Partial<IFilterItem>): void {
    if (!filterItem.startDate) {
      const startDate = this.dateService.setTimeToStartOfDay(new Date());
      filterItem.startDate = this.datePipe.transform(startDate, DateFormatEnum.YEAR_DATE_TIME_FORMAT);
    }
    if (!filterItem.endDate) {
      const endDate = this.dateService.setTimeToEndOfDay(new Date());
      filterItem.endDate = this.datePipe.transform(endDate, DateFormatEnum.YEAR_DATE_TIME_FORMAT);
    }
  }

  protected formFieldsChange(): void {
    this.modelSubject
      .pipe(
        debounceTime(250),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(filterItem => {
        if (filterItem) {
          this.onFilterChange(filterItem);
        }
      });
  }

  protected onInputValidation(filterItem: any): void {
    if (filterItem.field === 'inn') {
      filterItem.value = filterItem.value.replace(/\D/g, '').slice(0, 9);
    }
  }

  protected isInnValid(value: string | number): boolean {
    const str = value?.toString() || '';
    return /^\d{9}$/.test(str);
  }

  protected isGuidValid(value: string | number): boolean {
    const str = value?.toString()?.toLowerCase() || '';
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(str);
  }

  protected hasInvalidInn(): boolean {
    return this.filterItems.some(item =>
      item.field === 'inn' && item.value && !this.isInnValid(item.value)
    );
  }
}
