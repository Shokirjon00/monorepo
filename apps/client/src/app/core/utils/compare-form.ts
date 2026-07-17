import {Params} from "@angular/router";

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

function isObjectEqual  (obj1: Params, obj2: Params): boolean {
  return Object.keys(obj1).some(key => {
    if (typeof obj2[key] === 'object') {
      return isObjectEqual(obj1[key], obj2[key])
    }
    return obj1[key] !== obj2[key];
  })
}
