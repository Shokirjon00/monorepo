import { Params } from '@angular/router';

export function compareForm(obj1: Params, obj2: Params): boolean {
  const detailInfo = resetEmptyValue(obj1);
  const formValue = resetEmptyValue(obj2);
  return isObjectEqual(detailInfo, formValue)
}

function resetEmptyValue(formValue: Params): Params {
  for (const formKey in formValue) {
    if (typeof formValue[formKey] === 'object' && !Array.isArray(formValue[formKey]) && formValue[formKey] !== null) {
      formValue[formKey] = resetEmptyValue(formValue[formKey]);
    } else if (typeof formValue[formKey] === 'undefined' || formValue[formKey] === null || formValue[formKey] === '') {
      delete formValue[formKey];
    }
  }
  return formValue;
}

function isObjectEqual(obj1: Params, obj2: Params): boolean {
  if (obj1 === null || obj1 === undefined) {
    return obj1 === obj2;
  }
  if (obj2 === null || obj2 === undefined) {
    return false;
  }

  return Object.keys(obj1).some(key => {
    if (!(key in obj2)) {
      return true;
    }
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      return !isObjectEqual(obj1[key], obj2[key]);
    }
    return obj1[key] !== obj2[key];
  });
}

