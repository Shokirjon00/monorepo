import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@modules/auth/service/auth.service";
import { TokenService } from "@core/services/token.service";
import { Router } from "@angular/router";
import { MessageService } from "@core/services/message.service";
import { DestroyableComponent } from "@core/directives/destroyable.component";
import { PasswordValidator } from "@core/validators/password-validator";
import { finalize, takeUntil } from "rxjs";
import { RouteEnum } from "@core/enums/route.enum";
import { ToastEnum } from "@core/enums/toast-enum";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { NgxPermissionsService } from 'ngx-permissions';
import { SvgIconComponent } from "angular-svg-icon";
import { ValidatorModule } from "@shared/components/validator/validator.module";
import { PasswordInputRulesComponent } from "@shared/components/password-input-rules/password-input-rules.component";
import { ToastModule } from "@shared/components/toast/toast.module";
import { SharedModule } from "@shared/shared.module";


@Component({
  standalone: true,
  selector: 'em-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorModule,
    PasswordInputRulesComponent,
    ToastModule,
    SharedModule
],
})
export class ChangePasswordComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  capsOn: boolean;
  loading: boolean
  submitted: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private messageService = inject(MessageService)
  private permissionsService = inject(NgxPermissionsService);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm()
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
    this.authService.changePassword(this.form.value)
      .pipe(
        finalize(() => this.loading = this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (res.meta.route === RouteEnum.login) {
            this.authService.temporaryToken = res.meta.temporaryToken;
            this.getLogin();
          }
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          setValidationErrors(this.form, res);
        }
      });
  }

  trackCaps(e: any): void {
    e.target.value = e.target.value.replace(" ", "");
    this.capsOn = e.getModifierState('CapsLock')
  }

  getLogin(): void {
    this.loading = true
    this.authService.getLogin()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.tokenService.setTokens(res.meta);
        this.permissionsService.loadPermissions(res.data.permissions);
        sessionStorage.setItem('permissions', JSON.stringify(res.data.permissions));
        this.router.navigate(['/']).catch();
      })
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
      confirmPassword: ['', [
        Validators.required]],
    }, {
      validators: PasswordValidator.confirm('password', 'confirmPassword')
    });
  }

}
