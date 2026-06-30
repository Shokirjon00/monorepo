import { Component, OnInit, input } from '@angular/core';

import { AbstractControl } from '@angular/forms';
import {
  latinLowercasePattern,
  latinUppercasePattern,
  minLengthValidator,
  numberPattern,
  onlyLatinPattern,
  specialCharacterPattern
} from '@core/utils/custom-validators';

@Component({
  standalone: true,
  selector: 'em-password-input-rules',
  templateUrl: './password-input-rules.component.html',
  styleUrls: ['./password-input-rules.component.scss'],
  imports: []
})
export class PasswordInputRulesComponent implements OnInit {
  readonly passwordControl = input<AbstractControl>();
  readonly confirmPasswordControl = input<AbstractControl>();

  constructor() {
  }

  ngOnInit(): void {
    this.passwordControl().setValidators([
      minLengthValidator(8),
      latinUppercasePattern(),
      onlyLatinPattern(),
      latinLowercasePattern(),
      numberPattern(),
      specialCharacterPattern(),
    ]);
  }
}
