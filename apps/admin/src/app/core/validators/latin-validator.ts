import { AbstractControl, ValidatorFn } from '@angular/forms';

export function latinAndSpecialCharsValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^[a-zA-Z0-9 _!@#$%^&*(),.?":{}|<>]*$/.test(control.value);
    return valid ? null : { 'invalidCharacters': { value: control.value } };
  };
}
