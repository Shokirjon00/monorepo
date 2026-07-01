import { Directive, Input, OnDestroy, OnInit, output, } from '@angular/core';
import { KeyboardEnum } from '@eskhata/util';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { ActiveSelect } from '@eskhata/util';
import { IStatusSelect } from '@core/interfaces/status-select.interface';

@Directive({
  selector: '[emSelectTrigger]',
})
export class SelectTriggerDirective extends DestroyableComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean;
  @Input() itemLength: number;
  @Input() currentIndex: number = 0;
  @Input() isMultiSelect: boolean;
  readonly isOpenChange = output<boolean>()
  readonly valueChange = output<IStatusSelect>()

  constructor() {
    super();
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.changeKeyboard.bind(this), { passive: true });
  }

  changeKeyboard(evt: KeyboardEvent | any): void {
    if (!this.isOpen) return;

    const code = evt.code;

    if (code === KeyboardEnum.ARROW_DOWN || code === KeyboardEnum.ARROW_UP) {
      evt.preventDefault?.();
      this.valueChange.emit({ type: ActiveSelect.deactive, itemIndex: this.currentIndex });

      if (code === KeyboardEnum.ARROW_UP && this.currentIndex >= 0) {
        this.currentIndex--;
      } else if (code === KeyboardEnum.ARROW_DOWN && this.currentIndex < this.itemLength - 1) {
        this.currentIndex++;
      }

      this.currentIndex = Math.min(Math.max(0, this.currentIndex), this.itemLength);
      this.valueChange.emit({ type: ActiveSelect.active, itemIndex: this.currentIndex });
    } else if ((code === KeyboardEnum.ENTER || code === KeyboardEnum.NUMPAD_ENTER) && this.currentIndex >= 0) {
      this.valueChange.emit({ type: ActiveSelect.selected, itemIndex: this.currentIndex });
    } else if (code === KeyboardEnum.ESCAPE) {
      this.isOpenChange.emit(false);
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    document.removeEventListener('keydown', this.changeKeyboard.bind(this));
  }
}
