import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
export class GradationValidator {
  static IsPercentValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const gradation = control as FormGroup;

      const minValueControl = gradation.get('minValue');
      const maxValueControl = gradation.get('maxValue');
      const valueControl = gradation.get('value');
      const isPercentageControl = gradation.get('isPercentage');

      if (minValueControl && maxValueControl && minValueControl.value >= maxValueControl.value) {
        minValueControl.setErrors({ 'minIntervalGradation': true });
        maxValueControl.setErrors({ 'maxIntervalGradation': true });
      } else {
        minValueControl?.setErrors(null);
        maxValueControl?.setErrors(null);
      }

      if (isPercentageControl && isPercentageControl.value) {
        if (valueControl.value > 100) {
          valueControl.setErrors({ 'maxGradationValue': '100%' });
        } else {
          valueControl.setErrors(null);
        }
      } else {
        if (valueControl.value >= maxValueControl?.value) {
          valueControl.setErrors({ 'maxGradationValue': maxValueControl?.value });
        } else {
          valueControl.setErrors(null);
        }
      }

      return null;
    };
  }
}
