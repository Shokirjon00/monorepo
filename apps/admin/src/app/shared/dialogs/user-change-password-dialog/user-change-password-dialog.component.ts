import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '@core/services/user.service';
import {finalize, of, takeUntil} from 'rxjs';
import {DestroyableComponent} from '@eskhata/util';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MessageService} from '@eskhata/data-access';
import { ToastEnum, ErrorStatusCodeEnum } from '@eskhata/util';
import {PasswordValidator} from '@core/validators/password-validator';
import {delay, mergeMap} from 'rxjs/operators';
import {setValidationErrors} from '@core/validators/set-validation-errors';
import {Router} from '@angular/router';
import {AuthService} from '@modules/auth/service/auth.service';
import {TokenService} from '@core/services/token.service';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {SharedModule} from '@shared/shared.module';
import { PasswordInputRulesComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-user-change-password-dialog',
  templateUrl: './user-change-password-dialog.component.html',
  styleUrls: ['./user-change-password-dialog.component.scss'],
  imports: [
    AngularSvgIconModule,
    ReactiveFormsModule,
    SharedModule,
    ValidatorComponent,
    ToastComponent,
    MatDialogModule,
    PasswordInputRulesComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserChangePasswordDialogComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  loading: boolean
  showPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  capsOn: boolean;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<UserChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string
  ) {
    super()
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm()
  }

  onSubmit(): void {

    if (!this.form.valid) {
      return null;
    }
    this.submitted = true;
    this.loading = true;
    this.userService.changePassword(this.form.value)
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.dialogRef.close(res.message);
          this.logout()
        } else if (res.errorCode === ErrorStatusCodeEnum.USER_BLOCKED) {
          this.setTimeout(() => {
            this.logout();
          }, 3000)
        } else {
          setValidationErrors(this.form, res);
        }
      })
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

  trackCaps(e: KeyboardEvent): void {
    if (e.getModifierState) {
      this.capsOn = e.getModifierState('CapsLock');
    } else {
      this.capsOn = false;
    }
  }

  private createForm(): void {
    this.form = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        PasswordValidator.validate(),
        PasswordValidator.number(),
        PasswordValidator.uppercase(),
        PasswordValidator.lowercase(),
        PasswordValidator.specSymbol(),
        PasswordValidator.minLength(8),
        Validators.required]),
      confirmPassword: new FormControl('', Validators.required),
    }, {
      validators: PasswordValidator.confirm('newPassword', 'confirmPassword')
    });
  }

  private logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          localStorage.clear();
          this.tokenService.clearTokens();
          this.authService.temporaryToken = null;
          this.dialog.closeAll();
          this.router.navigate(['/auth'])
            .catch();
        }
      });
  }

}

