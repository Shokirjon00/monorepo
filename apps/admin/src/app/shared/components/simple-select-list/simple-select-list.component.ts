import {
  AfterContentInit,
  Component,
  DestroyRef,
  EventEmitter,
  inject, input,
  Input,
  Output, signal,
  WritableSignal
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isGuid } from '@core/utils/is-guid';
import { ActiveSelect } from '@eskhata/util';
import { IStatusSelect } from '@core/interfaces/status-select.interface';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { SelectTriggerModule } from '@core/directives/selec-trigger/select-trigger.module';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { isPhone } from '@core/helper';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IFilterParams, IPaginate } from "@core/interfaces";
import { InfiniteScrollDirective } from "@core/directives/infinite-scroll.directive";
import { finalize } from "rxjs/operators";
import { AutocompleteService } from "@core/services/autocomplete.service";
import { ActivatedRoute } from "@angular/router";

interface IDataSource {
  id: string;
  name: string;
  selected?: boolean;
}

@Component({
  standalone: true,
  selector: 'em-simple-select-list',
  templateUrl: './simple-select-list.component.html',
  styleUrls: ['./simple-select-list.component.scss'],
  imports: [
    AngularSvgIconModule,
    ClickOutsideModule,
    SelectTriggerModule,
    FormsModule,
    InfiniteScrollDirective
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SimpleSelectListComponent
    }
  ]
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
  @Output() changed = this.register(new EventEmitter());
  @Output() selectedItem = this.register(new EventEmitter());
  @Output() dropdownToggle = this.register(new EventEmitter());
  @Output() scrolled = this.register(new EventEmitter());
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
    this.bottomSheet.open(BottomSheetComponent, {
      panelClass: 'bottom-sheet',
      data: {
        dataSource: this.dataSource,
        selected: this.selected,
        optionLabel: this.optionLabel,
        optionValue: this.optionValue
      },
    })
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((option) => {
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
    } else if ((value === null) && this.selected) {
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
