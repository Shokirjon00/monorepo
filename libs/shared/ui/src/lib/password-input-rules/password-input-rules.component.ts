import { Component, OnInit, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  latinLowercasePattern,
  latinUppercasePattern,
  minLengthValidator,
  numberPattern,
  onlyLatinPattern,
  specialCharacterPattern,
} from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-password-input-rules',
  templateUrl: './password-input-rules.component.html',
  styleUrls: ['./password-input-rules.component.scss'],
})
export class PasswordInputRulesComponent implements OnInit {
  readonly passwordControl = input<AbstractControl>();
  readonly confirmPasswordControl = input<AbstractControl>();

  readonly latinOnly = input<boolean>(false);

  ngOnInit(): void {
    this.passwordControl().setValidators([
      minLengthValidator(8),
      latinUppercasePattern(),
      ...(this.latinOnly() ? [onlyLatinPattern()] : []),
      latinLowercasePattern(),
      numberPattern(),
      specialCharacterPattern(),
    ]);
  }
}
