import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

export class IssueMoneySettingsValidator {
  static validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let ctrl = control as FormGroup
      if (!ctrl.controls['isActive'].value) return Validators.nullValidator;
      return ctrl.controls['runAt'].value && ctrl.controls['issueMoneyPeriodTypeId'].value
        ? null : {'settingValidator': true};
    };
  }
}
