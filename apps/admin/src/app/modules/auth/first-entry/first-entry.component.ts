import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@modules/auth/service/auth.service';
import { finalize, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { PasswordValidator } from '@core/validators/password-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { SvgIconComponent } from "angular-svg-icon";
import { PreventSpaceDirective } from "@core/directives/space-false.directive";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { PasswordInputRulesComponent } from "@shared/components/password-input-rules/password-input-rules.component";
import { ToastComponent } from "@shared/components/toast/toast.component";

@Component({
  selector: 'em-first-entry',
  templateUrl: './first-entry.component.html',
  standalone: true,
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    PreventSpaceDirective,
    ValidatorComponent,
    PasswordInputRulesComponent,
    ToastComponent
  ],
  styleUrls: ['./first-entry.component.scss']
})
export class FirstEntryComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  loading: boolean
  showPassword: boolean;
  showConfirmPassword: boolean;
  capsOn: boolean;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
    if (!this.authService.temporaryToken) {
      this.router.navigate(['auth/login']).catch();
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return null;
    }
    this.submitted = true;
    this.loading = true;
    this.form.get('temporaryToken').setValue(this.authService.temporaryToken)
    this.authService.setPassword(this.form.value)
      .pipe(
        finalize(() => this.loading = false),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (!res.data.passwordExpired) {
            this.form.reset();
            this.router.navigate(['auth/login']).catch();
          }
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          setValidationErrors(this.form, res);
        }
      });
  }

  changePassShow(): void {
    this.showPassword = !this.showPassword;
  }

  changeConfirmPassShow(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  trackCaps(e: KeyboardEvent): void {
    this.capsOn = e.getModifierState('CapsLock');
  }

  private createForm(): void {
    this.form = this.fb.group({
      password: ['', [
        PasswordValidator.validate(),
        PasswordValidator.number(),
        PasswordValidator.uppercase(),
        PasswordValidator.lowercase(),
        PasswordValidator.specSymbol(),
        PasswordValidator.minLength(8),
        Validators.required]],
      passwordConfirmation: ['', Validators.required],
      temporaryToken: ''
    }, {
      validators: PasswordValidator.confirm('password', 'passwordConfirmation')
    });
  }

}
