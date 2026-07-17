import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {EMAIL_ESKHATA_PATTERN} from '@core/helper';

export class EskhataEmailValidator {

  static validate(): ValidatorFn {
    if (!EMAIL_ESKHATA_PATTERN) return Validators.nullValidator;
    const regex = new RegExp(EMAIL_ESKHATA_PATTERN);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = regex.test(control.value);
      return isDigit ? null : {'eskhataEmail': true};
    };
  }
}
