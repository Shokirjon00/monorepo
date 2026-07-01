import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { finalize, of, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { PasswordValidator } from '@core/validators/password-validator';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/service/auth.service';
import { TokenService } from '@core/services/token.service';
import { ErrorStatusCodeEnum } from '@eskhata/util';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { PasswordInputRulesComponent } from '@shared/components/password-input-rules/password-input-rules.component';
import { PreventSpaceDirective } from '@core/directives/prevent-space.directive';
import { SvgIconComponent } from 'angular-svg-icon';
import { ValidatorComponent } from '@shared/components/validator/validator.component';

@Component({
  selector: 'em-user-change-password-dialog',
  templateUrl: './user-change-password-dialog.component.html',
  styleUrls: ['./user-change-password-dialog.component.scss'],
  imports: [
    ToastComponent,
    PasswordInputRulesComponent,
    PreventSpaceDirective,
    ReactiveFormsModule,
    SvgIconComponent,
    MatDialogClose,
    ValidatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserChangePasswordDialogComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  loading: boolean;
  showPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  capsOn: boolean;

  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<UserChangePasswordDialogComponent>)
  readonly message = inject(MAT_DIALOG_DATA);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return null;
    }
    this.submitted = true;
    this.loading = true;
    this.userService
      .changePassword(this.form.value)
      .pipe(
        mergeMap(res => {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => (this.submitted = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.dialogRef.close(res.message);
          this.logout();
        } else if (res.errorCode === ErrorStatusCodeEnum.USER_BLOCKED) {
          this.setTimeout(this.logout, 3000);
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  changePassShow(): void {
    this.showPassword = !this.showPassword;
  }

  changeNewPassShow(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  changeConfirmPassShow(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  trackCaps(evt: KeyboardEvent): void {
    if (evt && typeof evt.getModifierState === 'function') {
      this.capsOn = evt.getModifierState('CapsLock');
    }
  }

  passwordConfirming(c: AbstractControl): { confirmPassword: boolean } {
    if (c.get('newPassword').value !== c.get('confirmPassword').value) {
      return { confirmPassword: true };
    }
  }

  private createForm(): void {
    this.form = new FormGroup(
      {
        currentPassword: new FormControl('', Validators.required),
        newPassword: new FormControl('', [
          PasswordValidator.validate(),
          PasswordValidator.number(),
          PasswordValidator.uppercase(),
          PasswordValidator.lowercase(),
          PasswordValidator.specSymbol(),
          PasswordValidator.minLength(8),
          Validators.required,
        ]),
        confirmPassword: new FormControl('', Validators.required),
      },
      { validators: this.passwordConfirming }
    );
  }

  private logout(): void {
    this.authService
      .logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          sessionStorage.clear();
          this.tokenService.clearTokens();
          this.authService.temporaryToken = null;
          this.dialog.closeAll();
          this.router.navigate(['/auth']).catch();
        }
      });
  }
}
