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

  /**
   * Adds the `onlyLatinPattern` validator and the matching rule row. Only the
   * client app applied it before the components were merged, so it stays opt-in
   * to keep admin's password fields validating exactly as they did.
   */
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
