import { Component, ElementRef, OnDestroy, input, signal, computed, viewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatDialogModule } from '@angular/material/dialog';
import { BaseFilterComponent, ClickOutsideModule, ICaption, ParamsEnum } from '@eskhata/util';

import { CustomSelectListComponent } from '../custom-select-list/custom-select-list.component';
import { SelectFieldSearchComponent } from '../select-field-search/select-field-search.component';
import { SimpleSelectListComponent } from '../simple-select-list/simple-select-list.component';
import { FieldListComponent } from './field-list/field-list.component';

import { ErrorTooltipComponent } from '../error-tooltip/error-tooltip.component';

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
    FieldListComponent,
    FormsModule,
    CustomSelectListComponent,
    SelectFieldSearchComponent,
    ErrorTooltipComponent,
  ],
  providers: [DatePipe],
})
export class QuickFilterComponent extends BaseFilterComponent implements OnDestroy {
  readonly inputElement = viewChildren<ElementRef>('input');
  showError: { [key: string]: boolean } = {};
  validationGuid = 'Неверный формат ID. Пример: 0196b1f7-8f7c-7c2a-b2d3-8c6f0f8f8abc';
  readonly maxHeight = input<string>('340px');
  readonly canSearch = input<boolean>(true);
  readonly filterParams = input<string>();
  readonly field = input<string>();
  readonly showFilterTitle = input<boolean>(true);
  readonly isAdvancePayments = input<boolean>(false);
  readonly param = ParamsEnum;
  addFilter = true;
  readonly isOpen = signal<boolean[]>([]);
  readonly selectedIndex = signal<number | null>(null);

  constructor() {
    super();
    this.formFieldsChange();
  }

  get showAddFilterButton(): boolean {
    return this.filterItems.length < 5 &&
      this.filterItems.length !== this._filterFields?.length;
  }

  resetAllFilters(): void {
    this.filterItems.forEach(filterItem => (filterItem.value = null));
    this.saveFilterToStorage({});
    this.addFilter = false;
    this.reloadPage();
  }
  applyFilterOnEnter(filterItem: Partial<IFilterItem>): void {
    if (filterItem.field === 'inn' && filterItem.value && !this.isInnValid(filterItem.value)) {
      return;
    }

    if (filterItem.field === 'id' && filterItem.value && !this.isGuidValid(filterItem.value)) {
      this.showError['id'] = true;
      return;
    }

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

  closeDropdown(idx: number): void {
    this.isOpen.update(v => {
      const copy = [...v];
      copy[idx] = false;
      return copy;
    });
  }

  openList(index: number): void {
    this.fields = this.getUnSelectedFields();
    const openState = [...this.isOpen()];
    openState[index] = !openState[index];
    this.isOpen.set(openState);
    this.selectedIndex.set(index);
  }

  dropdownOpened(id: number, value: boolean): void {
    if (value) {
      const openState = [...this.isOpen()];
      openState[id] = false;
      this.isOpen.set(openState);
    }
  }

  selectedChanged(newFilterItem: Partial<IFilterItem>, filterItem: Partial<IFilterItem>, index: number): void {
    const oldKey = filterItem.filterParams || filterItem.field;
    delete this.params[oldKey];
    this.filterItems[index] = newFilterItem;

    if (newFilterItem.filterType === 'date') {
      this.setDefaultDate(newFilterItem);
    } else {
      newFilterItem.value = '';
    }

    this.openList(index);
  }
}
