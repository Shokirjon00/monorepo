import { AfterContentInit, Component, DestroyRef, inject, Input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataSourceService } from '@eskhata/data-access';
import { ClickOutsideModule, DestroyableComponent, isPhone, ISource, SelectTriggerModule } from '@eskhata/util';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';

@Component({
  standalone: true,
  selector: 'em-custom-select-list',
  templateUrl: './custom-select-list.component.html',
  styleUrls: ['./custom-select-list.component.scss'],
  imports: [AngularSvgIconModule, ClickOutsideModule, SelectTriggerModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomSelectListComponent,
    },
    DataSourceService,
  ],
})
export class CustomSelectListComponent extends DestroyableComponent implements ControlValueAccessor, AfterContentInit {
  @Input() selected: any;
  @Input() action: any = '';
  @Input() type: string;
  @Input() filterKey: string;
  @Input() optionValue = 'id';
  @Input() optionLabel: string = 'name';
  @Input() showClear: boolean = true;
  @Input() inDisabled: boolean = true;
  @Input() apiUrl: string;
  @Input() isBottomSheet: boolean = false;

  readonly changed = output<{ selected: any; filterKey: string }>();
  readonly selectedItem = output<any>();
  readonly dropdownToggle = output<boolean>();

  items: any[] = [];
  isMobile = isPhone();

  private _isOpenDropdown: boolean = false;
  private value: string | number;
  private readonly dataSourceService = inject(DataSourceService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly destroyRef = inject(DestroyRef);

  get isOpenDropdown(): boolean {
    return this._isOpenDropdown;
  }

  set isOpenDropdown(value: boolean) {
    this.dropdownToggle.emit(value);
    this._isOpenDropdown = value;
  }

  clearValue(e: Event): void {
    this.selected = null;
    this.changed.emit({ selected: null, filterKey: this.filterKey });
    this.onChange(null);
    e.stopPropagation();
  }

  onSelect(option: any): void {
    this.selected = option;
    this.changed.emit({ selected: option, filterKey: this.filterKey });
    this.onChange(option[this.optionValue]);
    this.selectedItem.emit(option);
    this.isOpenDropdown = false;
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
          dataSource: this.items,
          selected: this.selected,
          labelKey: this.optionLabel,
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

  onChange = (_: any): void => {};
  onTouched = (): void => {};

  writeValue(value: string | number): void {
    this.value = value;
    if (!value) {
      return;
    }
    if (this.items?.length) {
      this.selected = this.items.find(item => item[this.optionValue] === this.value);
      if (this.selected) {
        this.changed.emit({ selected: this.selected, filterKey: this.filterKey });
      }
    }
  }

  ngAfterContentInit(): void {
    if (this.apiUrl) {
      this.getDataSource();
    }
    if (this.selected) {
      this.writeValue(this.selected[this.optionValue]);
    }
  }

  registerOnChange(fn: (_: any) => object): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => object): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  private getDataSource(): void {
    if (this.apiUrl) {
      const apiSource: ISource = {
        method: 'get',
        link: this.apiUrl,
      };
      this.dataSourceService
        .getSource(apiSource)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          this.items = res.status ? res.data : [];
          if (this.value) {
            this.writeValue(this.value);
          }
        });
    }
  }
}
