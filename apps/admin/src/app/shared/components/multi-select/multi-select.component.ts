import {Component, EventEmitter, forwardRef, Input, Output, input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {SharedModule} from '@shared/shared.module';
import {ClickOutsideModule} from '@core/directives/click-outside/click-outside.module';
import {IPaginate} from '@eskhata/util';
import {ISelect} from '@core/interfaces/select.interface';
import {DestroyableComponent} from '@core/abstract/destroyable.component';

@Component({
  standalone: true,
  selector: 'em-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  imports: [
    AngularSvgIconModule,
    ClickOutsideModule,
    SharedModule,
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
  @Input() pagination: IPaginate;
  @Output() pageScrolled: EventEmitter<IPaginate> = this.register(new EventEmitter<IPaginate>());
  @Output() changed = this.register(new EventEmitter());
  readonly optionValue = input('id');
  readonly optionLabel = input<string>('name');
  readonly disable = input<boolean>(true);
  readonly placeholder = input('');
  readonly maxHeight = input<string>('340px');
  readonly singleSelect = input<boolean>(false);
  open: boolean;
  selectedItems: Map<ISelect, ISelect> = new Map();
  ownSelectedIds: string[];

  private _dataSource: ISelect[];


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
