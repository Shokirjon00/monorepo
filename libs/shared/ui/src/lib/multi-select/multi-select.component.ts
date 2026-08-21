import { Component, forwardRef, inject, Input, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  ClickOutsideModule,
  DestroyableComponent,
  InfiniteScrollDirective,
  IPaginate,
  isPhone,
  ISelect,
} from '@eskhata/util';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { IDataSource } from '../bottom-sheet/interface/bottom-sheet-data';

@Component({
  standalone: true,
  selector: 'em-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  imports: [AngularSvgIconModule, ClickOutsideModule, InfiniteScrollDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent extends DestroyableComponent implements ControlValueAccessor {
  @Input() pagination: IPaginate;
  readonly optionValue = input('id');
  readonly optionLabel = input<string>('name');
  readonly disable = input<boolean>(true);
  readonly placeholder = input('');
  readonly maxHeight = input<string>('340px');
  readonly singleSelect = input<boolean>(false);
  readonly isBottomSheet = input<boolean>(false);

  readonly pageScrolled = output<IPaginate>();
  readonly changed = output<any>();

  open: boolean;
  selectedItems: Map<ISelect, ISelect> = new Map();
  ownSelectedIds: string[];
  readonly isMobile = isPhone();

  private _dataSource: IDataSource[];
  private readonly bottomSheet = inject(MatBottomSheet);

  get dataSource(): any[] {
    return this._dataSource;
  }

  get selectedItemsArray(): ISelect[] {
    return Array.from(this.selectedItems.values());
  }

  @Input()
  set dataSource(value: any[]) {
    this._dataSource = value;
    if (this.ownSelectedIds?.length) {
      for (const ownItemId of this.ownSelectedIds) {
        const selectedItem = this.dataSource.find(item => ownItemId === item.id);
        if (selectedItem) {
          const ownSelected = this.selectedItems.get(selectedItem);
          if (!ownSelected) {
            this.selectedItems.set(selectedItem, selectedItem);
          }
        }
      }
    }
  }

  onChange = (_: any): void => {};

  onTouched = (): void => {};

  writeValue(ids: string[]): void {
    if (!ids?.length) {
      this.ownSelectedIds = [];
      this.selectedItems.clear();
      return;
    }
    this.ownSelectedIds = ids;
    const timer = setTimeout(() => {
      for (const id of ids) {
        const selectedItem = this.dataSource?.find(item => id === item.id);
        if (selectedItem) {
          if (!this.selectedItems.has(selectedItem)) {
            this.selectedItems.set(selectedItem, selectedItem);
          }
        }
      }
      clearTimeout(timer);
    }, 300);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  isSelected(clickedItem: ISelect): boolean {
    return this.selectedItems.has(clickedItem);
  }

  onItemClick(event: MouseEvent, item: ISelect): void {
    const found = this.isSelected(item);

    const singleSelect = this.singleSelect();
    if (singleSelect && !found) {
      this.selectedItems.clear();
    }

    if (!found) {
      this.addSelected(item);
    } else {
      this.removeSelected(item);
    }
    if (singleSelect) {
      this.open = false;
    }
  }

  onScrolled(): void {
    this.pagination.pageNumber += 1;
    this.pageScrolled.emit(this.pagination);
  }

  toggle(): void {
    if (this.isMobile && this.isBottomSheet()) {
      const initialSelectedItems = Array.from(this.selectedItems.values());
      this.bottomSheet
        .open(BottomSheetComponent, {
          panelClass: 'bottom-sheet',
          disableClose: true,
          data: {
            dataSource: this.dataSource,
            selected: initialSelectedItems,
            isMultiSelect: true,
          },
        })
        .afterDismissed()
        .subscribe(option => {
          const newSelectedItems = new Map<ISelect, ISelect>(option.map((item: ISelect) => [item, item]));
          const initialItemsArray = JSON.stringify(initialSelectedItems);
          const newItemsArray = JSON.stringify(Array.from(newSelectedItems.values()));
          if (initialItemsArray !== newItemsArray) {
            this.selectedItems = newSelectedItems;
            this.onChange(this.emittedValue(this.selectedItems.values()));
            this.changed.emit(this.emittedValue(this.selectedItems.values()));
          }
        });
    } else {
      this.open = !this.open;
    }
  }

  private addSelected(item: ISelect): void {
    this.selectedItems.set(item, item);
    this.onChange(this.emittedValue(this.selectedItems.values()));
    this.changed.emit(this.emittedValue(this.selectedItems.values()));
  }

  private removeSelected(value: ISelect): void {
    this.selectedItems.delete(value);
    this.onChange(this.emittedValue(this.selectedItems.values()));
    this.changed.emit(this.emittedValue(this.selectedItems.values()));
  }

  private emittedValue(value: IterableIterator<ISelect>): string[] {
    return Array.from([...value]).map(item => item.id);
  }
}
