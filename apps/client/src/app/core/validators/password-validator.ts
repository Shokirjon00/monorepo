import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { NAME_PATTERN, PASSWORD_PATTERN } from "@core/helper";

export class PasswordValidator{

  static validate(): ValidatorFn {
    if (!PASSWORD_PATTERN) return Validators.nullValidator;
    let regex = new RegExp(PASSWORD_PATTERN);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = regex.test(control.value);
      return isDigit ? null : {'password': true};
    };
  }

  static uppercase(): ValidatorFn {
    let uppercaseLetter = new RegExp("[A-ZЁА-Я]");

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = uppercaseLetter.test(control.value)
      return isDigit ? null : {'uppercaseLetter': true};
    };
  }

  static lowercase(): ValidatorFn {
    let lowercaseLetter = new RegExp("[a-zёа-я]");

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = lowercaseLetter.test(control.value)
      return isDigit ? null : {'lowercaseLetter': true};
    };
  }

  static minLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = control.value.length > minLength
      return isDigit ? null : {'passMinLength': true};
    };
  }

  static specSymbol(): ValidatorFn {
    let specSymbols = new RegExp("[_.:;+-=*?&!%@#$^()'\"/]");

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = specSymbols.test(control.value)
      return isDigit ? null : {'specSymbols': true};
    };
  }

  static number(): ValidatorFn {
    let numbers = new RegExp("[0-9]");

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = numbers.test(control.value)
      return isDigit ? null : {'numbers': true};
    };
  }

  static confirm(field:string, confirmFiled:string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      let pass = group.get(field);
      let confirmPass = group.get(confirmFiled)
      if (pass.value !== confirmPass.value) {
        confirmPass.setErrors({'confirmPassword': true})
        return {'confirmPassword': true};
      }
      return null;
    };
  }
  static onlyLatinAndCrilicChar(): ValidatorFn {
    if (!NAME_PATTERN) return Validators.nullValidator;
    const string = new RegExp(NAME_PATTERN);

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isDigit = string.test(control.value)
      return isDigit ? null : {'string': true};
    };
  }

}
