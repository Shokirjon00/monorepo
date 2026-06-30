import { Component, Input, OnDestroy, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'em-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.scss'],
})
export class ValidatorComponent implements OnDestroy {
  field: any = input<any>();
  readonly validationMessage = input<string>();

  private _control: AbstractControl | any;

  constructor() {}

  @Input() set fieldControl(value: AbstractControl) {
    this._control = value;
  }

  get fieldControl(): AbstractControl {
    return this._control;
  }

  ngOnDestroy(): void {
    this._control = null;
    this.field = null;
  }
}
