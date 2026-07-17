import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AfterContentInit, Component, DestroyRef, EventEmitter, inject, Input, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ClickOutsideModule } from "@core/directives/click-outside/click-outside.module";
import { SelectTriggerModule } from "@core/directives/selec-trigger/select-trigger.module";
import { DataSourceService } from "@core/services/data-source.service";
import { ISource } from "@core/interfaces/source";
import { isPhone } from "@core/helper";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "@shared/components/bottom-sheet/bottom-sheet.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-custom-select-list',
  templateUrl: './custom-select-list.component.html',
  styleUrls: ['./custom-select-list.component.scss'],
  imports: [
    AngularSvgIconModule,
    ClickOutsideModule,
    SelectTriggerModule,
    FormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomSelectListComponent
    },
    DataSourceService
  ]
})

export class CustomSelectListComponent extends DestroyableComponent implements ControlValueAccessor, AfterContentInit {
  @Input() selected: any;
  @Input() action: any = '';
  @Input() type: string;
  @Input() optionValue = 'id';
  @Input() optionLabel: string = 'name';
  @Input() showClear: boolean = true;
  @Input() inDisabled: boolean = true;
  @Input() apiUrl: string;
  @Output() changed = new EventEmitter();
  @Output() selectedItem = new EventEmitter();
  @Output() dropdownToggle = this.register(new EventEmitter());
  @Input() isBottomSheet: boolean = false;

  items: any[] = [];
  isMobile = isPhone();

  private _isOpenDropdown: boolean = false;
  private value: string | number;
  private readonly dataSourceService = inject(DataSourceService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly destroyRef = inject(DestroyRef);

  get isOpenDropdown(): boolean{
    return this._isOpenDropdown;
  }

  set isOpenDropdown(value: boolean){
    this.dropdownToggle.emit(value);
    this._isOpenDropdown = value;
  }

  clearValue(e: Event): void {
    this.selected = null;
    this.changed.emit(null);
    this.onChange(null);
    e.stopPropagation();
  }

  onSelect(option: any): void {
    this.selected = option;
    this.changed.emit(option);
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
    this.bottomSheet.open(BottomSheetComponent, {
      panelClass: 'bottom-sheet',
      data: {
        dataSource: this.items,
        selected: this.selected,
        optionLabel: this.optionLabel,
        optionValue: this.optionValue,
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

  onChange = (_: any): void => {
  };
  onTouched = (): void => {
  };

  writeValue(value: string | number): void {
    this.value = value;
    if (!value) {
      return;
    }
    if (this.items?.length) {
      this.selected = this.items.find(item => item[this.optionValue] === this.value);
      if (this.selected) {
        this.changed.emit(this.selected);
      }
    }
  }


  ngAfterContentInit(): void {
    if (this.apiUrl) {
      this.getDataSource();
    }
    this.writeValue(this.selected && this.selected[this.optionValue]);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  private getDataSource(): void {
    if (this.apiUrl) {
      const apiSource: ISource = {
        method: 'get',
        link: this.apiUrl
      };
      this.dataSourceService.getSource(apiSource)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
            this.items = res.status ? res.data : [];
            if (this.value) {
              this.writeValue(this.value);
            }
          }
        );
    }
  }
}
