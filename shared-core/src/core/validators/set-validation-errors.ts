import {AbstractControl, FormArray, FormGroup} from "@angular/forms";

export function setValidationErrors(form: FormGroup,response: any): void{
  for (const key in response.errors) {
    const field = form.get(key);
    if (response.errors.hasOwnProperty(key) && field) {
      field.setErrors({serverErrors: response.errors[key]});
    }
  }
  form.setErrors({serverError: response.message});
}
export function setNestedGroupValidationErrors(form: FormGroup, response: any): void {
  for (const key in response.errors) {
    if (response.errors.hasOwnProperty(key)) {
      const result = key.split(/[\[\].\s]/);

      if (result.length < 4 || !result[1] || !result[3]) {
        console.warn(`Unexpected key format: ${key}`);
        continue;
      }

      const formKey = result[1].charAt(0).toLowerCase() + result[1].slice(1);
      const index = Number(result[3]);

      let field: AbstractControl | any = form.get(formKey);

      if (field instanceof FormArray) {
        const formArrayField = field as FormArray;
        field = formArrayField.at(index);
      }

      if (field) {
        field.setErrors({ serverErrors: response.errors[key] });
      } else {
        console.warn(`Field not found for key: ${formKey} at index: ${index}`);
      }
    }
  }
}

