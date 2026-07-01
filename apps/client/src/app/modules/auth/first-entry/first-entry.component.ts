import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DestroyableComponent } from "@core/directives/destroyable.component";
import { AuthService } from "@modules/auth/service/auth.service";
import { TokenService } from "@core/services/token.service";
import { RouteEnum } from '@eskhata/util';
import { Component, inject, OnInit } from '@angular/core';
import { finalize, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { MessageService } from "@core/services/message.service";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { ToastEnum } from '@eskhata/util';
import { NgxPermissionsService } from 'ngx-permissions';
import { SvgIconComponent } from "angular-svg-icon";
import { SharedModule } from "@shared/shared.module";
import { PasswordInputRulesComponent } from "@shared/components/password-input-rules/password-input-rules.component";
import { ToastModule } from "@shared/components/toast/toast.module";


@Component({
  standalone: true,
  selector: 'em-first-entry',
  templateUrl: './first-entry.component.html',
  styleUrls: ['./first-entry.component.scss'],
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    SharedModule,
    PasswordInputRulesComponent,
    ToastModule
],
})
export class FirstEntryComponent extends DestroyableComponent implements OnInit {
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
    this.authService.setPassword(this.form.value)
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
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.errors.password});
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

  trackCaps(e: any): void {
    e.target.value = e.target.value.replace(" ", "");
    if (e?.getModifierState) {
      this.capsOn = e.getModifierState('CapsLock');
    }
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

  passwordConfirming(c: AbstractControl): { confirmPassword: boolean } {
    if (c.get('password').value !== c.get('confirmPassword').value) {
      return {confirmPassword: true};
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {validators: this.passwordConfirming});
  }
}
