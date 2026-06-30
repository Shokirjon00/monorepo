import { Component, ElementRef, input, Input, computed, inject, viewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first, Subject, takeUntil } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { getFromLocalStorage, setToLocalStorage } from '@core/utils';
import { debounceTime } from 'rxjs/operators';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { CustomSelectListComponent } from '@shared/components/custom-select-list/custom-select-list.component';
import { SelectFieldSearchComponent } from '@shared/components/select-field-search/select-field-search.component';
import { IParam } from '@core/interfaces';
import { ICaption } from '@core/interfaces/table1.interface';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { StatusTypeConstants } from '@core/constants/status-type.constants';
import { FieldListComponent } from '@shared/components/quick-filter/field-list/field-list.component';
import { ParamsEnum } from '@core/enums/param';

interface IFilterItem extends ICaption {
  startDate: string;
  endDate: string;
}

@Component({
  standalone: true,
  selector: 'em-quick-filter',
  templateUrl: './quick-filter.component.html',
  styleUrls: ['./quick-filter.component.scss'],
  imports: [
    ReactiveFormsModule,
    AngularSvgIconModule,
    MatDialogModule,
    CommonModule,
    ClickOutsideModule,
    SimpleSelectListComponent,
    FormsModule,
    CustomSelectListComponent,
    SelectFieldSearchComponent,
    FieldListComponent,
  ],
  providers: [DatePipe],
})
export class QuickFilterComponent extends DestroyableComponent {
  readonly inputElement = viewChildren<ElementRef>('input');
  @Input() maxHeight: string = '340px';
  @Input() canSearch?: boolean = true;
  @Input() defaultFilterField: string = 'name';
  @Input() filterParams: string;
  @Input() field: string;
  @Input() isAdvancePayments = false;

  readonly showFilterTitle = input<boolean>(true);

  fields: Partial<IFilterItem>[] | any;
  isOpen: boolean[] = [];
  selectedIndex: number;
  activeStatus = StatusTypeConstants.statuses;
  refundApplicationStatus = StatusTypeConstants.refundApplicationStatus;
  sendType = StatusTypeConstants.sendType;
  refundType = StatusTypeConstants.refundType;
  actionType = StatusTypeConstants.type;
  modelSubject: Subject<any> = new Subject<any>();
  addFilter = true;

  protected filterItems: Partial<IFilterItem>[] = [];
  readonly param = ParamsEnum;
  private _filterFields: ICaption[];
  private _fieldsMap: IParam = {};
  private _key: string;
  private params: Params = {};
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    super();
    this.formFieldsChange();
  }

  @Input() set key(value: string) {
    if (value) {
      this.filterItems = [];
      this._key = value;
    }
  }

  @Input() set filterFields(value: ICaption[]) {
    this.clearFilter();
    this._filterFields = value.filter(item => item.field && !item.isFiltered);
    this.initFilterFields(this._filterFields);
  }

  get showAddFilterButton(): boolean {
    return this.filterItems.length <= 4 && this.filterItems?.length !== this._filterFields?.length;
  }

  applyFilterOnEnter(filterItem: Partial<IFilterItem>): void {
    const isFieldEmpty = !filterItem.value && !filterItem.startDate && !filterItem.endDate;
    if (isFieldEmpty) {
      delete this.params[filterItem.field];
      if (filterItem.filterParams) {
        delete this.params[filterItem.filterParams];
      }
      filterItem.value = null;
      filterItem.startDate = null;
      filterItem.endDate = null;
    } else {
      this.onFilterChange(filterItem);
    }
    this.saveFilterToStorage(this.params);
    this.reloadPage();
  }

  addFilterLabel(): void {
    const field = this.getUnSelectedFields()[0];
    if (field.filterType === 'date') {
      this.setDefaultDate(field);
    } else {
      field.value = null;
    }
    this.filterItems.push(field);
  }

  openList(index: number): void {
    this.fields = this.getUnSelectedFields();
    this.isOpen[index] = !this.isOpen[index];
    this.selectedIndex = index;
  }

  dropdownOpened(id: number, value: boolean): void {
    if (value) {
      this.isOpen[id] = false;
    }
  }

  clearInput(filterItem: Partial<IFilterItem>): void {
    if (filterItem.filterType === 'date') {
      filterItem.startDate = null;
      filterItem.endDate = null;
    } else {
      filterItem.value = null;
    }

    this.filterItems = this.filterItems.filter(item => item.key !== filterItem.field);
    delete this.params[filterItem.field];

    if (filterItem.filterParams) {
      delete this.params[filterItem.filterParams];
    }

    this.saveFilterToStorage({ ...this.params });
    this.reloadPage();
  }

  onFilterChange(filterItem: Partial<IFilterItem>): void {
    if (filterItem.filterType === 'date') {
      const startDate = this.datePipe.transform(
        filterItem.startDate || this.getDefaultStartDate(),
        DateFormatEnum.YEAR_DATE_TIME_FORMAT
      );
      const endDate = this.datePipe.transform(
        filterItem.endDate || this.getDefaultEndDate(),
        DateFormatEnum.YEAR_DATE_TIME_FORMAT
      );
      this.params[filterItem.field] = `${startDate} ${endDate}`;
    } else {
      this.params[filterItem.field] = filterItem.value;
    }
    this.params[this.param.PAGE] = 1;
    this.saveFilterToStorage(Object.assign({}, this.params));
  }

  removeField(index: number, key: string): void {
    const filterParams = this.filterItems[index]?.filterParams;
    this.filterItems.splice(index, 1);
    delete this.params[key];
    if (filterParams) {
      delete this.params[filterParams];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  selectedChanged(newFilterItem: Partial<IFilterItem>, filterItem: Partial<IFilterItem>, index: number): void {
    delete this.params[filterItem.field];
    delete this.params[filterItem.filterParams];
    this.filterItems.splice(index, 1, newFilterItem);

    if (newFilterItem.filterType === 'date') {
      this.setDefaultDate(newFilterItem);
      this.params[newFilterItem.field] = `${newFilterItem.startDate} ${newFilterItem.endDate}`;
    } else {
      newFilterItem.value = '';
    }
    this.reloadPage();
    this.openList(index);
  }

  selectStatus(field: { key: string; value: string }): void {
    if (field) {
      this.params[this.param.IS_ACTIVE] = field.value;
    } else {
      delete this.params[this.param.IS_ACTIVE];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  selectStatusType(field: { selected: { key: string; id: string }; filterKey: string }): void {
    if (field.selected) {
      this.params[field.filterKey] = field.selected.id;
    } else {
      delete this.params[field.filterKey];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  searchDropdown(field: { key: string; id: string }, filterParams: string, placeholder: string): void {
    if (field) {
      this.params[filterParams] = field.id;
    } else {
      delete this.params[filterParams];
    }
    this.saveFilterToStorage({ ...this.params });
    this.reloadPage();
  }

  selectRefundApplicationStatus(field: { key: string; value: string }): void {
    if (field) {
      this.params[this.param.STATUS_ID] = field.value;
    } else {
      delete this.params[this.param.STATUS_ID];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  selectSendType(field: { key: string; value: string }): void {
    if (field) {
      this.params[this.param.SEND_TYPE] = field.value;
    } else {
      delete this.params[this.param.SEND_TYPE];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  selectRefundType(field: { key: string; value: string }): void {
    if (field) {
      this.params[this.param.CAN_REFUND_NAME] = field.value;
    } else {
      delete this.params[this.param.CAN_REFUND_NAME];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  selectActionType(field: { key: string; value: string }): void {
    if (field) {
      this.params[this.param.TYPE] = field.value;
    } else {
      delete this.params[this.param.TYPE];
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
  }

  resetAllFilters(): void {
    this.filterItems.forEach(filterItem => filterItem.value = null);
    this.saveFilterToStorage({});
    this.addFilter = false;
    this.reloadPage();
  }

  /**
   * filter unselected fields
   */
  private getUnSelectedFields(): Partial<IFilterItem>[] {
    const values = this.filterItems.map(({ field }) => field);
    return this._filterFields.filter(item => !values.includes(item.field));
  }

  private formFieldsChange(): void {
    this.modelSubject.pipe(debounceTime(250), takeUntil(this.destroyed$)).subscribe(filterItem => {
      if (filterItem) {
        this.onFilterChange(filterItem);
      }
    });
  }

  private reloadPage(): void {
    const currentParams = this.route.snapshot.queryParams;
    const mergedParams = { ...currentParams, ...this.params };

    Object.keys(currentParams).forEach(key => {
      if (!(key in this.params) && this._fieldsMap[key]) {
        mergedParams[key] = undefined;
      }
    });

    this.router.navigate([], { relativeTo: this.route, queryParams: mergedParams }).catch();
  }

  private saveFilterToStorage(queryParams: Params): void {
    if (this._key) {
      setToLocalStorage(this._key, queryParams);
    }
  }

  private initFilterFields(captions: ICaption[]): void {
    captions.forEach(
      item => (this._fieldsMap[item.filterType === 'search-dropdown' ? item.filterParams : item.field] = item)
    );
    this.route.queryParams.pipe(first()).subscribe(params => {
      const queryParams = Object.keys(params).length !== 0 ? params : getFromLocalStorage(this._key);

      this.parseRouteParams(queryParams);
      this.params[this.param.PAGE] = queryParams?.['page'] || 1;
      this.params[this.param.PAGE_SIZE] = queryParams?.['pageSize'] || 15;

      this.saveFilterToStorage(this.params);
      this.reloadPage();
    });

    this.setDefaultFilterFields();
  }

  private setDefaultFilterFields(): void {
    let defaultValue: Partial<IFilterItem> = this._fieldsMap[this.defaultFilterField];

    if (!this.filterItems.length) {
      defaultValue ||= this.getUnSelectedFields()[0];
      if (defaultValue.filterType === 'date') {
        this.setDefaultDate(defaultValue);
      }
      this.onFilterChange(defaultValue);
      this.filterItems.push(defaultValue);
    }
  }

  /**
   * apply route filter params
   */
  private parseRouteParams(params: IParam): void {
    for (const paramKey in params) {
      if (this._fieldsMap[paramKey]) {
        const field = this._fieldsMap[paramKey];
        this.params[paramKey] = params[paramKey];
        if (this._fieldsMap[paramKey].filterType === 'date') {
          const dates = params[paramKey].split(' ');
          field.startDate = dates[0];
          field.endDate = dates[1];
        } else {
          field.value = params[paramKey];
          this._fieldsMap[paramKey].value = params[paramKey];
        }
        this.filterItems.push(field);
      }
    }
  }

  private clearFilter(): void {
    this.filterItems = [];
    this.params = {};
    this.reloadPage();
  }

  /**
   * set full date
   */
  private setDefaultDate(filterItem: Partial<IFilterItem>): void {
    const currentDate = new Date();
    const startDate = this.setTimeToStartOfDay(currentDate);
    filterItem.startDate = this.datePipe.transform(startDate, DateFormatEnum.YEAR_DATE_TIME_FORMAT);
    const endDate = this.setTimeToEndOfDay(currentDate);
    filterItem.endDate = this.datePipe.transform(endDate, DateFormatEnum.YEAR_DATE_TIME_FORMAT);
  }

  private getDefaultStartDate(): string {
    const startDate = this.setTimeToStartOfDay(new Date());
    return startDate.toISOString();
  }

  private getDefaultEndDate(): string {
    const endDate = this.setTimeToEndOfDay(new Date());
    return endDate.toISOString();
  }

  private setTimeToStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  private setTimeToEndOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 0, 0);
    return newDate;
  }
}
