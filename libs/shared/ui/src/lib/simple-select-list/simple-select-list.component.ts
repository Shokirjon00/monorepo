import { AfterContentInit, Component, DestroyRef, inject, Input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  ActiveSelect,
  ClickOutsideModule,
  DestroyableComponent,
  InfiniteScrollDirective,
  IPaginate,
  isGuid,
  isPhone,
  IStatusSelect,
  SelectTriggerModule,
} from '@eskhata/util';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { IDataSource } from '../bottom-sheet/interface/bottom-sheet-data';

@Component({
  standalone: true,
  selector: 'em-simple-select-list',
  templateUrl: './simple-select-list.component.html',
  styleUrls: ['./simple-select-list.component.scss'],
  imports: [SvgIconComponent, ClickOutsideModule, SelectTriggerModule, FormsModule, InfiniteScrollDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SimpleSelectListComponent,
    },
  ],
})
export class SimpleSelectListComponent extends DestroyableComponent implements ControlValueAccessor, AfterContentInit {
  @Input() selected: any;
  @Input() action: any = '';
  @Input() type: string;
  @Input() optionValue = 'id';
  @Input() optionLabel: string = 'name';
  @Input() showClear: boolean = true;
  @Input() isBottomSheet: boolean = false;
  @Input() pagination: IPaginate;
  @Input() ngModelOptions!: { standalone: boolean };

  readonly changed = output<any>();
  readonly selectedItem = output<any>();
  readonly dropdownToggle = output<boolean>();
  readonly scrolled = output<void>();

  isMobile = isPhone();
  disabled: boolean = false;

  private _isOpenDropdown: boolean = false;
  private _dataSource: IDataSource[];
  private value: string;
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly destroyRef = inject(DestroyRef);

  get dataSource(): any[] {
    return this._dataSource;
  }

  @Input()
  set dataSource(value: any[]) {
    this._dataSource = value;
    if (this.value) {
      this.writeValue(this.value);
    }
  }

  get isOpenDropdown(): boolean {
    return this._isOpenDropdown;
  }

  set isOpenDropdown(value: boolean) {
    this.dropdownToggle.emit(value);
    this._isOpenDropdown = value;
  }

  onScrolled(): void {
    this.scrolled.emit();
  }

  toggle(): void {
    if (this.isMobile && this.isBottomSheet) {
      this.openBottomSheet();
    } else {
      this.isOpenDropdown = !this.isOpenDropdown;
    }
  }

  openBottomSheet(): void {
    this.bottomSheet
      .open(BottomSheetComponent, {
        panelClass: 'bottom-sheet',
        data: {
          dataSource: this.dataSource,
          selected: this.selected,
          optionLabel: this.optionLabel,
          optionValue: this.optionValue,
        },
      })
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(option => {
        if (option) {
          this.onSelect(option);
        }
      });
  }

  clearValue(e: Event): void {
    this.selected = null;
    this.changed?.emit(null);
    this.onChange(null);
    e.stopPropagation();
  }

  valueChange(evt: IStatusSelect): void {
    if (evt.type === ActiveSelect.active) {
      this._dataSource[evt.itemIndex].selected = true;
    } else if (evt.type === ActiveSelect.deactive) {
      this._dataSource[evt.itemIndex].selected = false;
    } else if (evt.type === ActiveSelect.selected) {
      this.onSelect(this.dataSource[evt.itemIndex]);
    }
  }

  onSelect(option: any): void {
    this.selected = option;
    this.changed.emit(option);
    this.onChange(option[this.optionValue]);
    this.selectedItem.emit(option);
    this.isOpenDropdown = false;
  }

  onChange = (_: any): void => {};

  onTouched = (): void => {};

  writeValue(value: string): void {
    this.value = value;
    if (value === '') {
      return;
    } else if (value === null && this.selected) {
      this.selected = null;
    }
    if (isGuid(value) || value || typeof value === 'boolean') {
      this.selected = (this.dataSource || []).find(item => item[this.optionValue] === value);
      if (this.selected) {
        this.changed.emit(this.selected);
      }
    }
  }

  ngAfterContentInit(): void {
    this.writeValue(this.selected && this.selected[this.optionValue]);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
