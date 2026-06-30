import { AfterContentInit, Component, DestroyRef, inject, Input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActiveSelect } from '@core/enums/active-select';
import { IStatusSelect } from '@core/interfaces/status-select.interface';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { isPhone } from '@core/helper';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { SelectTriggerModule } from '@core/directives/selec-trigger/select-trigger.module';
import { SvgIconComponent } from 'angular-svg-icon';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { IDataSource } from '@shared/components/simple-select-list/data-source';
import { filter, startWith, take, tap } from 'rxjs/operators';
import { interval, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: ' em-simple-select-list',
  templateUrl: './simple-select-list.component.html',
  styleUrls: ['./simple-select-list.component.scss'],
  imports: [ClickOutsideModule, SelectTriggerModule, SvgIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SimpleSelectListComponent,
    },
  ],
})
export class SimpleSelectListComponent implements ControlValueAccessor, AfterContentInit {
  @Input() selected: any;
  @Input() action: string = '';
  @Input() type: string;
  @Input() optionValue = 'id';
  @Input() optionLabel: string = 'name';
  @Input() showClear: boolean = true;
  @Input() isBottomSheet: boolean = false;
  @Input() ngModelOptions!: { standalone: boolean };
  readonly changed = output<any>();

  isOpenDropdown: boolean;
  isMobile = isPhone();

  private _dataSource: IDataSource[];
  private readonly destroyRef = inject(DestroyRef);

  onChange: any = () => {};
  onTouched: any = () => {};

  private bottomSheet = inject(MatBottomSheet);

  get dataSource(): any[] {
    return this._dataSource;
  }

  @Input()
  set dataSource(value: any[]) {
    this._dataSource = value;
  }

  toggle(): void {
    if (this.isMobile && this.isBottomSheet) {
      this.bottomSheet
        .open(BottomSheetComponent, {
          panelClass: 'bottom-sheet',
          data: {
            dataSource: this.dataSource,
            selected: this.selected,
          },
        })
        .afterDismissed()
        .subscribe(option => option && this.onSelect(option));
    } else {
      this.isOpenDropdown = !this.isOpenDropdown;
    }
  }

  clearValue(e: Event): void {
    this.selected = null;
    this.changed.emit(null);
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
    this.isOpenDropdown = false;
  }

  writeValue(value: string): void {
    if (!value) {
      this.selected = null;
      return;
    }

    interval(300)
      .pipe(
        startWith(0),
        map(() => (this.dataSource || []).find(item => item[this.optionValue] === value)),
        filter(Boolean),
        take(1),
        tap(selected => this.changed.emit(selected)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(selected => (this.selected = selected!));
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
}
