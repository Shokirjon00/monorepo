import { Component, forwardRef, inject, Input, output, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { isPhone } from '@core/helper';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ISelect } from "@core/interfaces/select.interface";
import { DestroyableComponent } from "@core/directives/destroyable.component";


interface IDataSource {
  id: string;
  name: string;
  selected?: boolean
}

@Component({
  standalone: true,
  selector: 'em-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  imports: [
    AngularSvgIconModule,
    ClickOutsideModule,
    SharedModule
],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ]
})
export class MultiSelectComponent extends DestroyableComponent implements ControlValueAccessor {
  @Input() isBottomSheet: boolean = false;
  @Input() optionValue = 'id';
  @Input() pagination: IPaginate;
  @Input() optionLabel: string = 'name';
  @Input() disable: boolean = true;
  @Input() placeholder = '';
  @Input() maxHeight: string = '340px';
  readonly pageScrolled =  output<IPaginate>();
  readonly changed = output<any>();
  open: boolean;
  selectedItems: Map<ISelect, ISelect> = new Map();
  ownSelectedIds: string[];
  readonly isMobile = isPhone();
  private _dataSource: IDataSource[];
  private bottomSheet = inject(MatBottomSheet);

  get dataSource(): any[] {
    return this._dataSource;
  }
  get selectedItemsArray(): ISelect[]{
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

  onChange = (_: any): void => {
  };
  onTouched = (): void => {
  };

  writeValue(ids: string[]): void {
    if (!ids?.length) {
      this.ownSelectedIds = [];
      this.selectedItems.clear();
      return
    }
    this.ownSelectedIds = ids;
    const timer = setTimeout(() => {
      for (const id of ids) {
        const selectedItem = this.dataSource?.find(item => id === item.id);
        if (selectedItem) {
          if (!this.selectedItems.has(selectedItem)) {
            this.selectedItems.set(selectedItem, selectedItem)
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
    if (!found) {
      this.addSelected(item);
    } else {
      this.removeSelected(item);
    }
  }

  onScrolled(): void {
    this.pagination.pageNumber += 1
    this.pageScrolled.emit(this.pagination)
  }

  toggle(): void {
    if (this.isMobile && this.isBottomSheet) {
      const initialSelectedItems = Array.from(this.selectedItems.values());
      this.bottomSheet.open(BottomSheetComponent, {
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
    return Array.from([...value]).map(item => (item.id))
  }
}
