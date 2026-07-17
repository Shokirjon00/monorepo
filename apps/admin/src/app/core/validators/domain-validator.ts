import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {IP_OR_DOMAIN_PATTERN} from "@core/helper";

export class IpOrDomainValidator {

  static validate(): ValidatorFn {
    if (!IP_OR_DOMAIN_PATTERN) return Validators.nullValidator;
    const regex = new RegExp(IP_OR_DOMAIN_PATTERN);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      for (let ip of control.value) {
        if (!regex.test(ip)) return  { 'invalidIpOrDomain': true };
      }
      return  null;
    };
  }
}

