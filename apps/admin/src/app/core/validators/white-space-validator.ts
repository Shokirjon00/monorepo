import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class WhiteSpaceValidator {
  static validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : {'whiteSpace': true};
    };
  }
}
