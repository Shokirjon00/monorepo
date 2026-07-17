import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@modules/auth/service/auth.service";
import { finalize, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { DestroyableComponent } from "@core/directives/destroyable.component";
import { RouteEnum, ToastEnum, WhiteSpaceValidator, KeyboardEnum } from '@eskhata/util';
import { TokenService } from "@core/services/token.service";
import { MessageService } from "@core/services/message.service";
import { LOGIN_PATTERN } from "@core/helper";
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { NgxPermissionsService } from 'ngx-permissions';
import { SvgIconComponent } from "angular-svg-icon";
import { SharedModule } from "@shared/shared.module";
import { ValidatorModule } from "@shared/components/validator/validator.module";
import { ToastModule } from "@shared/components/toast/toast.module";


@Component({
  standalone: true,
  selector: 'em-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    SharedModule,
    ValidatorModule,
    ToastModule
],
})
export class LoginComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  capsOn: boolean;
  loading: boolean;
  showPassword: boolean;
  private returnUrl: string;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private messageService = inject(MessageService)
  private permissionsService = inject(NgxPermissionsService);
  private activated = inject(ActivatedRoute);

  get f(): any {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.sayHello();
    this.createForm();
  }

  onSubmit(): void {
    this.loading = true;
    if (!this.authService.temporaryToken) {
      this.sayHello(true);
      return null;
    }
    this.authService.login(this.form.value)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.authService.temporaryToken = res.meta.temporaryToken;
          if (res.meta.route === RouteEnum.setPassword) {
            this.router.navigate(['/auth', 'first-password'], {
              queryParams: {username: this.f.username.value},
              skipLocationChange: true
            }).catch();
          } else if (res.meta.route === RouteEnum.changePasswordIfExpired) {
            this.router.navigate(['/auth', 'new-password'], {
              queryParams: {username: this.f.username.value},
              skipLocationChange: true
            }).catch();
          } else if (res.meta.route === RouteEnum.login) {
            this.getLogin();
          } else {
            this.router.navigate([this.returnUrl]).catch();
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

  trackCaps(evt: KeyboardEvent): void {
    if (evt && typeof evt.getModifierState === 'function') {
      if (evt.key === KeyboardEnum.ENTER) {
        evt.preventDefault();
      }
      this.capsOn = evt.getModifierState('CapsLock');
    }
  }

  navigate(): void {
    this.router.navigate(['/auth', 'reset-password']).catch();
  }

  private sayHello(tryLogin = false): void {
    this.authService.hello()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.authService.temporaryToken = res.meta.temporaryToken;
          if (tryLogin) {
            this.onSubmit();
          }
        }
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(LOGIN_PATTERN)]],
      password: ['', [Validators.required, WhiteSpaceValidator.validate()]]
    });
  }

  private getLogin(): void {
    this.loading = true;
    this.authService.getLogin()
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {
        this.tokenService.setTokens(res.meta);
        this.permissionsService.loadPermissions(res.data.permissions);
        sessionStorage.setItem('permissions', JSON.stringify(res.data.permissions));
        this.router.navigate([this.activated.snapshot.queryParams['returnUrl'] || '/']).catch()
      });
  }
}
