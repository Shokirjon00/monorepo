import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';
import { parseFilterParams } from '@core/utils/filter-util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute } from '@angular/router';
import { AutocompleteService } from '@core/services/autocomplete.service';
import { IPaginate } from '@eskhata/util';
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { SvgIconComponent } from "angular-svg-icon";
import { SharedModule } from "@shared/shared.module";
import { ISelect } from "@core/interfaces";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IBottomSheetData, IDataSource } from "@shared/components/bottom-sheet/interface/bottom-sheet-data";


@Component({
  standalone: true,
  selector: 'em-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class BottomSheetComponent extends DestroyableComponent {
  readonly searchElem = viewChild<ElementRef>('searchElem');
  canSearch?: boolean = false;
  dataSource: any[];
  initialLoad: boolean = false;
  searchField$ = new FormControl('');
  searchPlaceholder: string = 'Название элемента';
  labelKey: string = 'name';
  selected?: any[];
  selectedId: string;
  path: string;
  loading: boolean = false;
  pagination: IPaginate;
  selectedIndex: number;
  selectedItems: IDataSource[] = [];
  images: [];
  customFilters: any;
  isMultiSelect: boolean = false;
  currentSelection: any;

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AutocompleteService);
  private readonly bottomSheetRef = inject(MatBottomSheetRef<BottomSheetComponent>);
  private readonly data: IBottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);

  queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    filters: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.initializeData();
    if (this.data.initialData) {
      this.dataSource = this.data.initialData;
    }
    this.loadData();
    this.setupDataHandling();
  }

  private loadData(): void {
    this.service.getSearchData(this.data.path)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSource = [...this.dataSource, ...res.data];
        }
      });
  }

  isSelected(clickedItem: ISelect | any): boolean {
    return this.selected[0]?.id && this.selected.some((item: any) => clickedItem?.id === item?.id);
  }

  onSelect(option: any): void {
    this.bottomSheetRef.dismiss(option);
    this.searchField$.setValue('', {emitEvent: true});
  }

  setIcon(): void {
    this.dataSource.forEach((item, i) => item.icon = this.images[i]);
  }

  onSelectMulti(item: IDataSource): void {
    const found = this.isMultiSelected(item);
    if (!found) {
      this.addSelected(item);
    } else {
      this.removeSelected(item);
    }
  }

  addSelected(item: IDataSource): void {
    this.selectedItems.push(item);
  }

  removeSelected(value: IDataSource): void {
    const data = this.selectedItems.findIndex(item => item.id === value.id);
    this.selectedItems.splice(data, 1);
  }

  isMultiSelected(clickedItem: IDataSource): boolean {
    return this.selectedItems.some(item => clickedItem?.id === item?.id);
  }

  onScrolled(): void {
    this.queryParams.page += 1;
    this.searchData(this.path, true);
  }

  private setupDataHandling(): void {
    if (!Array.isArray(this.dataSource)) {
      this.dataSource = [];
    }

    if (this.path || this.selectedId) {
      this.searchData(this.path);
    }

    if (this.isMultiSelect) {
      this.selectedItems = this.selected.filter(item => item.id);
      this.bottomSheetRef.backdropClick()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.bottomSheetRef.dismiss(this.selectedItems));
    }
  }

  private initializeData(): void {
    this.dataSource = Array.isArray(this.data.dataSource) ? this.data.dataSource : [];
    this.selectedItems = this.data.selected || [];
    this.canSearch = this.data.canSearch || false;
    this.path = this.data.path || '';
    this.searchPlaceholder = this.data.searchPlaceholder || '';
    this.labelKey = this.data.labelKey || 'name';
    this.customFilters = this.data.customFilters || '';
    this.isMultiSelect = this.data.isMultiSelect || false;
    this.currentSelection = this.data.currentValue;
  }

  private searchData(path: string, scrolled: boolean = false): void {
    let value = '';
    this.searchField$.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap((searchValue: any) => {
          value = searchValue;
          this.loading = true;
          if (!scrolled) {
            this.queryParams.page = 1
          }
          if (this.customFilters) {
            this.queryParams = parseFilterParams({name: '', ...this.customFilters}, this.queryParams, []);
          } else {
            this.queryParams = parseFilterParams({name: searchValue}, this.queryParams, []);
          }
          return this.service.getSearchData(path, this.queryParams)
            .pipe(finalize(() => this.loading = false));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.data?.length) {
          if (scrolled) {
            this.dataSource = this.dataSource.concat(res.data);
            scrolled = false;
          } else {
            this.dataSource = res.data;
          }
          if (this.selectedIndex) {
            this.selected = this.dataSource[this.selectedIndex];
          }
          if (this.selectedId) {
            this.selected = []
            if (Array.isArray(this.selectedId)) {
              for (const id of this.selectedId) {
                const selectedItem = this.dataSource.find(item => id === item.id)
                if (selectedItem) {
                  this.selected.push(selectedItem)
                }
              }
            } else {
              const selectedItem = this.dataSource.find(item => item.id === this.selectedId);
              this.selected.push(selectedItem)
            }
          }
          if (this.images && this.images.length) {
            this.setIcon();
          }
          this.pagination = res.meta?.pagination;
        } else {
          this.dataSource = res.data;
        }
      });
  }
}
