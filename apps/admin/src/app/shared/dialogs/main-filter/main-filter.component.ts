import {
  Component,
  ElementRef, inject,
  OnInit,
  input, signal, computed,
  viewChildren
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { ICaption } from '@core/interfaces';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { CustomSelectListComponent } from '@shared/components/custom-select-list/custom-select-list.component';
import { SelectFieldSearchComponent } from "@shared/components/select-field-search/select-field-search.component";
import { DataSourceService } from "@core/services/data-source.service";
import { BottomSheetComponent } from "@shared/components/bottom-sheet/bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseFilterComponent } from "@core/abstract/base-filter";

@Component({
  standalone: true,
  selector: 'em-main-filter',
  templateUrl: './main-filter.component.html',
  styleUrls: ['./main-filter.component.scss'],
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
  ],
  providers: [
    DatePipe,
    DataSourceService
  ]
})
export class MainFilterComponent extends BaseFilterComponent implements OnInit {
  readonly inputElement = viewChildren<ElementRef>('input');
  filterParams = input<string>();
  field = input<string>();
  readonly maxHeight = input<string>('340px');
  readonly canSearch = input<boolean>(true);
  readonly isOpen = signal<boolean[]>([]);
  readonly selectedIndex = signal<number | null>(null);
  form: FormGroup;
  captions: ICaption[] = [];
  componentKey: string;

  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly modalRef = inject(MatDialogRef<MainFilterComponent>);

  constructor() {
    super();
    this.captions = this.data.captions;
    this.componentKey = this.data.componentKey;
    this.formFieldsChange();
  }

  get showAddFilterButton(): boolean {
    return this.filterItems.length < 5 &&
      this.filterItems.length !== this._filterFields?.length;
  }


  ngOnInit(): void {
    this.initializeFilters();
  }

  applyFilter(): void {
    this.filterItems.forEach(item => {
      if (item.value || (item.filterType === 'date' && (item.startDate || item.endDate))) {
        this.onFilterChange(item);
      } else {
        const paramKey = item.filterParams || item.field;
        delete this.params[paramKey];
      }
    });

    this.params['page'] = 1;
    this.applyParamsAndReload();
    this.modalRef.close(true);
  }

  openList(index: number): void {
    this.fields = this.getUnSelectedFields();
    this.selectedIndex.set(index);
    this.openBottomSheet(index);
  }

  dropdownOpened(id: number, value: boolean): void {
    if (value) {
      const openState = [...this.isOpen()];
      openState[id] = false;
      this.isOpen.set(openState);
    }
  }

  closeDropdown(idx: number): void {
    this.isOpen.update(v => {
      const copy = [...v];
      copy[idx] = false;
      return copy;
    });
  }

  onSearchItemSelected(selectedItem: any, filterItem: any, placeholder: string): void {
    const paramKey = filterItem.filterParams || filterItem.field;

    if (selectedItem) {
      filterItem.value = selectedItem.id;
      this.params[paramKey] = selectedItem.id;
    } else {
      delete this.params[paramKey];
    }

    this.params['page'] = 1;
    this.saveFilterToStorage(this.params);
    this.reloadPage();
  }

  onOpenBottomSheet(filterItem: any): void {
    this.bottomSheet.open(BottomSheetComponent, {
      panelClass: 'bottom-sheet',
      data: {
        path: filterItem.apiUrl,
        canSearch: true,
        searchPlaceholder: filterItem.placeholder || 'Поиск',
        labelKey: 'name',
        selectedId: this.params[filterItem.filterParams],
        isSearchMode: true,
        placeholder: filterItem.placeholder
      }
    }).afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedValue) => {
        if (selectedValue) {
          this.onSearchItemSelected(selectedValue, filterItem, filterItem.placeholder);
        }
      });
  }

  resetFilter(): void {
    this.params = {};
    this.filterItems = [];
    this.saveFilterToStorage(Object.assign({}, this.params));
    this.reloadPage();
    this.modalRef.close(true);
  }

  private initializeFilters(): void {
    if (this.data) {
      this._filterFields = this.data.filterFields || [];
      this.defaultFilterField = this.data.defaultFilterField || 'name';
      this.filterParams = this.data.filterParams || '';
      this.field = this.data.field || '';
      this.initFilterFields(this._filterFields);
    }
  }

  private openBottomSheet(index: number): void {
    this.bottomSheet.open(BottomSheetComponent, {
      panelClass: 'bottom-sheet',
      data: {
        dataSource: this.fields,
        isFieldSelection: true,
        captionKey: 'caption'
      }
    }).afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedField) => {
        if (selectedField) {
          this.filterItems[index] = selectedField;
        }
      });
  }
}
