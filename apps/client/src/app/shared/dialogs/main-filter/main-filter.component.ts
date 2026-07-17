import { Component, DestroyRef, inject, TemplateRef, viewChild } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ICaption } from '@core/interfaces/table.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IKeyValue } from '@core/interfaces/key-value.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { DatePipe } from '@angular/common';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MultiDropdownComponent } from '@shared/components/multi-dropdown/multi-dropdown.component';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { environment as env } from '@environments/environment';
import { PERIOD_ID, TODAY_ID } from "@core/helper";
import { DateFormatEnum } from "@core/enums/date-format.enum";
import { IFilterParams, IParam } from "@core/interfaces";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { getFromLocalStorage, setToLocalStorage } from "@core/utils";
import { StatusTypeConstants } from "@core/constants/status-type.constants";
import moment from "moment";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CustomSelectListComponent } from '@shared/components/custom-select-list/custom-select-list.component';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'em-main-filter',
  templateUrl: './main-filter.component.html',
  styleUrls: ['./main-filter.component.scss'],
  imports: [
    SharedModule,
    AngularSvgIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    DropdownComponent,
    MultiDropdownComponent,
    SimpleSelectListComponent,
  ],
  providers: [DatePipe],
})
export class MainFilterComponent extends DestroyableComponent {
  readonly calendar = viewChild<TemplateRef<any>>('calendar');
  componentKey: string;
  captions: ICaption[] = [];
  fieldMap: { [key: string]: any } = {};
  filterDataList: ICaption[];
  addFilteredDataList: ICaption[];
  filterItems: IKeyValue[] = [];
  form: FormGroup;
  params: Params | any = {};
  selected: null;
  isCustomFilter: boolean = false;
  dateType: { name: string; icon?: string; id?: string };
  selectedMerchant: [{ name: string; icon: string }];
  selectedPos: { name: string; icon: string };
  selectedPosType: { name: string; icon: string };
  typeDictionaryApi = `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.foodProductApplicationsType}`;
  merchantApi = `${env.api.merchants}/${env.api.dictionary}`;
  posesApi = `${env.api.poses}/${env.api.dictionary}`;
  posesTypeApi = `${env.api.analyticsPosType}/${env.api.dictionary}`;
  dataFilterApi = `${env.api.analytics}/${env.api.dateFilter}`;
  dateTypeImage: any = ['day.svg', 'day.svg', 'week.svg', 'month.svg', 'year.svg', 'period.svg'];
  dateFlag: boolean;
  merchantFilter: IFilterParams | any = {};
  posFilter: IFilterParams | any = {};
  posTypeFilter: IFilterParams | any = {};
  queryParams: IFilterParams | any = { page: 1 };
  typeOptions: IKeyValue[] = [];
  activeStatus = StatusTypeConstants.statuses;
  sendType = StatusTypeConstants.sendType;
  refundApplicationStatus = StatusTypeConstants.refundApplicationStatus;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly datePipe = inject(DatePipe);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalRef = inject(MatDialogRef<MainFilterComponent>);
  private readonly matDialog = inject(MatDialog);
  private readonly data = inject(MAT_DIALOG_DATA);
  private http = inject(HttpClient);

  constructor() {
    super();
    this.componentKey = this.data.componentKey;
    this.captions = this.data.captions;
    this.isCustomFilter = this.data.isCustomFilter;
    this.dateType = this.data.dateType;
    this.selectedMerchant = this.data.selectedMerchant;
    this.selectedPos = this.data.selectedPos;
    this.selectedPosType = this.data.selectedPosType;
    this.form = this.fb.group({ filters: this.fb.array([]) });
    this.filterDataList = this.captions.filter(item => item.field && !item.isFiltered);
    this.initData(this.filterDataList);
    this.loadTypeDictionary();
  }

  get filtersFormArray(): FormArray {
    return this.form.get('filters') as FormArray;
  }

  initData(captions: ICaption[]): void {
    const captionField = this.buildCaptionField(captions);
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const hasParams = Object.keys(params).length > 0;
      const queryParams = hasParams ? params : getFromLocalStorage(this.componentKey);

      if (!hasParams && queryParams) {
        this.replaceUrlWithQueryParams(queryParams);
      }

      if (queryParams) {
        this.params = { ...queryParams };
        this.restoreFiltersFromParams(queryParams, captionField);

        if (!hasParams) {
          this.replaceUrlWithQueryParams(queryParams);
        }
      }

      this.setDefaultFilterIfNeeded(captions);
      this.buildFieldMap(captions);
    });
  }

  setFilter(value: ICaption, clear = false): void {
    const values = this.filtersFormArray.value.map((item: ICaption) => item.field);
    const formGroup = this.createFilterGroup();
    formGroup.patchValue(value);
    if (clear) this.filtersFormArray.clear();
    if (this.filtersFormArray.length) {
      if (!values.includes(value.field)) {
        this.filtersFormArray.push(formGroup);
      }
    } else {
      this.filtersFormArray.push(formGroup);
    }
  }

  createFilterGroup(): FormGroup {
    return this.fb.group({
      key: '',
      value: '',
      endDate: '',
      field: '',
      type: '',
      filterType: '',
    });
  }

  addFilter(): void {
    const values = this.filtersFormArray.value.map((item: ICaption) => item.field);
    this.addFilteredDataList = this.filterDataList.filter(item => !values.includes(item.field));
    this.bottomSheet
      .open(BottomSheetComponent, {
        panelClass: 'bottom-sheet',
        data: {
          dataSource: this.addFilteredDataList,
          labelKey: 'key',
        },
      })
      .afterDismissed()
      .subscribe(option => {
        if (option) {
          if (option.filterType === 'date') {
            option.value = new Date().toJSON().slice(0, 10);
            option.endDate = new Date().toJSON().slice(0, 10);
            this.filterItems.push({ key: option.field, value: '', type: option.filterType });
          } else {
            this.filterItems.push({ key: option.field, value: '', type: option.filterType });
          }
          this.setFilter(option);
        }
      });
  }

  removeFilter(filterIndex: number): void {
    this.filtersFormArray.removeAt(filterIndex);
    const data = this.filterItems.splice(filterIndex, 1);
    if (data[0] && data[0].key) {
      this.filterDataList.find(item => item.field === data[0].key).value = '';
      delete this.params[data[0].key];
    }
  }

  selectStatus(field: { key: string; value: string }): void {
    if (field) {
      this.params['isActive'] = field.value;
    } else {
      delete this.params['isActive'];
    }
  }

  selectSendType(field: { key: string; value: string }): void {
    if (field) {
      this.params['sendType'] = field.value;
    } else {
      delete this.params['sendType'];
    }
  }

  selectRefundApplicationStatus(field: { key: string; value: string }): void {
    if (field) {
      this.params['statusId'] = field.value;
    } else {
      delete this.params['statusId'];
    }
  }

  selectStatusType(field: { key: string; value: string }): void {
    if (field) {
      this.params['type'] = field.value;
    } else {
      delete this.params['type'];
    }
  }

  clearInput(index: number): void {
    const filterControl = this.filtersFormArray.at(index) as FormGroup;
    const { filterType } = filterControl.value;

    this.clearFilterControlValues(filterControl);
    this.clearFilterParams(filterType, filterControl);
  }

  applyFilter(): void {
    const storageKey = this.componentKey;
    const storedFilters = this.getStoredFilters(storageKey);

    this.filtersFormArray.controls.forEach(control => {
      const formValue = control.value;

      if (formValue.filterType === 'date') {
        const startDate = moment(formValue.value, DateFormatEnum.YEAR_DATE_LOCAL_FORMAT);
        const endDate = moment(formValue.endDate, DateFormatEnum.YEAR_DATE_LOCAL_FORMAT);
        if (startDate && endDate) {
          const start = startDate.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT);
          const end = endDate.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT);
          this.params[formValue.field] = `${start} ${end}`;
        } else {
          delete this.params[formValue.field];
        }
      } else {
        if (formValue.value) {
          this.params[formValue.field] = formValue.value;
        } else {
          delete this.params[formValue.field];
        }
      }
    });

    const cleanedFilters = this.cleanOldFilters(storedFilters);
    this.saveFiltersToLocalStorage(storageKey, cleanedFilters);
    this.saveFilterToStorage({ ...this.params });
    this.reloadPage();
    this.modalRef.close(true);
  }

  resetFilter(): void {
    this.params = {};
    this.filterItems = [];
    if (this.isCustomFilter) this.setDefault();
    this.filterDataList.forEach(item => {
      item.value = '';
      item.endDate = '';
    });
    this.filtersFormArray.controls.forEach((item, index) => {
      const formValue = this.filtersFormArray.controls[index].value;
      formValue.value = '';
      formValue.endDate = '';
      this.filtersFormArray.controls[index].patchValue(formValue);
    });
    if (this.componentKey) {
      localStorage.removeItem(this.componentKey);
    }
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
    this.modalRef.close('reset');
  }

  setDefault(): void {
    this.selectedMerchant = [{ name: 'Все торговые точки', icon: 'checkmark-double.svg' }];
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    this.dateType = { name: 'Сегодня' };
  }

  dateChange(dateId: string): void {
    if (dateId === PERIOD_ID) {
      this.matDialog
        .open(SelectPeriodDialogComponent, {
          data: {
            start: this.params.startDate,
            end: this.params.endDate,
            maxSelectDays: 31,
          },
          panelClass: 'date-picker',
        })
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          if (res) {
            this.dateFlag = true;
            this.params.startDate = res.start.format(DateFormatEnum.DATE_TIME_FORMAT);
            this.params.endDate = res.end.format(DateFormatEnum.DATE_TIME_FORMAT);
            const startDateFormatted = this.datePipe.transform(res.start, 'dd.MM.yyyy');
            const endDateFormatted = this.datePipe.transform(res.end, 'dd.MM.yyyy');
            this.params.startedAt = `${dateId}|${startDateFormatted} ${endDateFormatted}`;
            this.dateType = {
              name: res.start.format(DateFormatEnum.DATE_FORMAT) + ' - ' + res.end.format(DateFormatEnum.DATE_FORMAT),
              icon: 'week.svg',
              id: PERIOD_ID,
            };
          } else {
            if (this.params.startDate && this.params.endDate) {
              const { startDate, endDate } = this.params;
              this.dateType = {
                name:
                  this.datePipe.transform(new Date(startDate), DateFormatEnum.DATE_FORMAT) +
                  ' - ' +
                  this.datePipe.transform(new Date(endDate), DateFormatEnum.DATE_FORMAT),
                icon: 'week.svg',
                id: PERIOD_ID,
              };
            }
          }
        });
    } else {
      this.dateFlag = false;
      this.params.startDate = '';
      this.params.endDate = '';
      delete this.params['startDate'];
      delete this.params['endDate'];
      this.params.startedAt = dateId;
    }
  }

  clearPeriod(): void {
    if (this.params.startDate && this.params.endDate) {
      this.params.startedAt = TODAY_ID;
      delete this.params['startDate'];
      delete this.params['endDate'];
      this.dateType = { name: 'Сегодня', icon: 'day.svg', id: TODAY_ID };
      this.dateFlag = false;
    }
  }

  merchantChange(merchantIds: string[]): void {
    this.params.merchantId = merchantIds;
    this.merchantFilter.merchantId = merchantIds;
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    this.posFilter.merchantId = merchantIds;
    this.params.posId = '';
  }

  clearMerchant(): void {
    this.params.posId = '';
    this.params.merchantId = '';
    this.selectedMerchant = [{ name: 'Все торговые точки', icon: 'checkmark-double.svg' }];
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
  }

  posesChange(posId: string[]): void {
    this.params.posId = posId;
    this.posTypeFilter.id = this.queryParams.posId;
  }

  clearPos(): void {
    this.params.posId = '';
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
  }

  posesTypeChange(posesTypeId: string[]): void {
    this.params.posTypeId = posesTypeId;
  }

  clearPosType(): void {
    this.params.posTypeId = '';
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
  }

  private buildCaptionField(captions: ICaption[]): Record<string, ICaption> {
    const captionField: Record<string, ICaption> = {};
    captions.forEach(item => (captionField[item.field] = item));
    return captionField;
  }

  private restoreFiltersFromParams(queryParams: any, captionField: Record<string, ICaption>): void {
    for (const paramKey in queryParams) {
      const caption = captionField[paramKey];

      if (caption) {
        if (caption.filterType === 'date') {
          let dates = queryParams[paramKey].split(' ');
          const startDate = moment(dates[0]).format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT);
          const endDate = moment(dates[1]).format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT);
          caption.value = startDate;
          caption.endDate = endDate;
          this.filterItems.push({ key: paramKey, value: startDate, endDate, type: caption.type });
        } else {
          caption.value = queryParams[paramKey];
          this.filterItems.push({ key: paramKey, value: queryParams[paramKey], type: caption.type });
        }

        this.setFilter(caption);
      }

      if (paramKey === 'merchantId') {
        const ids = Array.isArray(queryParams.merchantId) ? queryParams.merchantId : [queryParams.merchantId];
        this.queryParams.merchantId = ids;
        this.posFilter.merchantId = ids;
      }
    }
  }

  private setDefaultFilterIfNeeded(captions: ICaption[]): void {
    const defaultField =
      this.componentKey === 'payment'
        ? captions.find(item => item.field === 'createdAt')
        : captions.find(item => item.field === 'name');

    if (defaultField && !this.filterItems.length) {
      this.setFilter(defaultField, true);

      if (defaultField.filterType === 'date') {
        const today = new Date().toISOString().slice(0, 10);
        const formValue = this.filtersFormArray.controls[0].value;
        formValue.value = today;
        formValue.endDate = today;
        this.filtersFormArray.controls[0].patchValue(formValue);
      } else {
        this.filterItems.push({ key: defaultField.field, value: '', endDate: '', type: defaultField.filterType });
      }
    }
  }

  private buildFieldMap(captions: ICaption[]): void {
    captions.forEach((item, index) => {
      if (index === 0 && this.filterItems.length === 0) {
        item.value = '';
        this.setFilter(item, true);
        this.filterItems.push({ key: item.field, value: '', type: item.filterType });
      }
      if (item.field) {
        this.fieldMap[item.field] = item;
      }
    });
  }

  private getStoredFilters(storageKey: string): Record<string, unknown> {
    return getFromLocalStorage(storageKey) || {};
  }

  private cleanOldFilters(storedFilters: Record<string, any>): Record<string, unknown> {
    for (const key of Object.keys(storedFilters)) {
      if (!(key in this.params)) {
        delete storedFilters[key];
      }
    }
    return { ...storedFilters, ...this.params };
  }

  private saveFiltersToLocalStorage(storageKey: string, cleanedFilters: Record<string, unknown>): void {
    if (Object.keys(this.params).length > 1) {
      setToLocalStorage(storageKey, cleanedFilters);
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  private saveFilterToStorage(queryParams: Params): void {
    if (this.componentKey) {
      setToLocalStorage(this.componentKey, queryParams);
    }
  }

  private replaceUrlWithQueryParams(queryParams: IParam): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .catch();
  }

  private reloadPage(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: this.params }).catch();
  }

  private clearFilterControlValues(filterControl: FormGroup): void {
    filterControl.patchValue({
      value: '',
      endDate: '',
    });
  }

  private clearFilterParams(filterType: string, filterControl: FormGroup): void {
    switch (filterType) {
      case 'send_type':
        this.removeParam('sendType');
        break;
      case 'payment_refund_application_statuses':
        this.removeParam('statusId');
        break;
      case 'list':
        this.removeParam('isActive');
        break;
      case 'dropdown':
        this.removeParam('type');
        break;
      case 'date':
        this.removeParam(filterControl.value.field);
        break;
    }
  }

  private removeParam(paramKey: string): void {
    delete this.params[paramKey];
  }

  private loadTypeDictionary(): void {
    this.http.get<any>(this.typeDictionaryApi)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.typeOptions = res.data.map((item: any)  => ({
          id: item.id,
          key: item.name
        }));
      });
  }

}
