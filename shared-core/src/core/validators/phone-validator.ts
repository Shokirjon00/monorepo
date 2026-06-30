import {AbstractControl, FormArray, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import { PHONE_NUMBER_VALIDATION } from '@shared-core/helper';

export class PhoneValidator{

  static validate(): ValidatorFn {
    if (!PHONE_NUMBER_VALIDATION) return Validators.nullValidator;
    let regex = new RegExp(PHONE_NUMBER_VALIDATION);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = regex.test(control.value);
      return isDigit ? null : {'phoneNumber': true};
    };
  }

  static uniquePhoneValidate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const controlArray = control as FormArray;
      if (controlArray.length < 1) return Validators.nullValidator;
      let similar: any;
      for (let i = 0; i <= controlArray.length; i++) {
        if (similar) break;
        for (let j = i + 1; j <= controlArray.length; j++) {
          if (controlArray.value[i] == controlArray.value[j]) {
            similar = true;
            break;
          }
        }
      }
      return similar ? {"similarNumbers": true} : null
    };
  }
}
