import { Component, Input, OnDestroy, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'em-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.scss'],
})
export class ValidatorComponent implements OnDestroy {
  field = input<any>();
  readonly validationMessage = input<string>();

  private _control: AbstractControl;

  get fieldControl(): AbstractControl {
    return this._control;
  }

  @Input() set fieldControl(value: AbstractControl) {
    this._control = value;
  }

  ngOnDestroy(): void {
    this._control = null;
    this.field = null;
  }
}
