import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function latinUppercasePattern(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]+/.test(value);

    return !hasUpperCase ? { latinUppercasePattern: true } : null;
  };
}

export function latinLowercasePattern(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasLowerCase = /[a-z]+/.test(value);

    return !hasLowerCase ? { latinLowercasePattern: true } : null;
  };
}

export function numberPattern(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]+/.test(value);

    return !hasNumber ? { numberPattern: true } : null;
  };
}

export function specialCharacterPattern(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasSpecialCharacter = /[\!@#$%^&*()\[\]{}\-_+=~|:;.?]/.test(value);

    return !hasSpecialCharacter ? { specialCharacterPattern: true } : null;
  };
}

export function minLengthValidator(minLength: number): any {
  return (control: any) => {
    if (isEmptyInputValue(control.value?.toString()) || !hasValidLength(control.value?.toString())) {
      return null;
    }
    return control.value?.toString().length < minLength
      ? { minlength: { requiredLength: minLength, actualLength: control.value.length } }
      : null;
  };
}

export function onlyLatinPattern(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }
    const hasUpperCase = /^[a-z0-9!@#$%^&*()[\]{}\-_+=~|:;.?]+$/i.test(value);
    return !hasUpperCase ? { latinPattern: true } : null;
  };
}

export function latinPatternValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^[A-Za-z-_]*$/.test(control.value);
    return valid ? null : { invalidCharacters: { value: control.value } };
  };
}

export function digitsOnlyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valid = /^\d+$/.test(control.value);
    return valid ? null : { nonDigitCharacters: true };
  };
}

function isEmptyInputValue(value: any): boolean {
  return value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0);
}

function hasValidLength(value: any): boolean {
  return value != null && typeof value.length === 'number';
}
