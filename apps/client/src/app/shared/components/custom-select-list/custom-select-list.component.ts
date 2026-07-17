import { DestroyableComponent } from '@core/directives/destroyable.component';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AfterContentInit, Component, inject, Input, output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { SelectTriggerModule } from '@core/directives/selec-trigger/select-trigger.module';
import { takeUntil } from 'rxjs';
import { DataSourceService } from '@core/services/data-source.service';
import { ISource } from '@core/interfaces/source';

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

  readonly changed = output<{ selected: any; filterKey: string }>();
  readonly dropdownToggle = output<boolean>();

  items: any[] = [];

  private _isOpenDropdown: boolean = false;
  private value: string | number;
  private readonly dataSourceService = inject(DataSourceService);

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
    this.isOpenDropdown = false;
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
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.items = res.status ? res.data : [];
          if (this.value) {
            this.writeValue(this.value);
          }
        });
    }
  }
}
