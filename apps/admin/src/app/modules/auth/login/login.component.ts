import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@modules/auth/service/auth.service';
import { finalize, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TokenService } from '@core/services/token.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { NgxPermissionsService } from 'ngx-permissions';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { LOGIN_PATTERN } from '@core/helper';
import { SvgIconComponent } from "angular-svg-icon";
import { PreventSpaceDirective } from "@core/directives/space-false.directive";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";

@Component({
  selector: 'em-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    PreventSpaceDirective,
    ValidatorComponent,
    ToastComponent
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  capsOn: boolean;
  loading: boolean;
  showPassword: boolean;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly tokenService = inject(TokenService);
  private readonly permissionsService = inject(NgxPermissionsService);
  private readonly activated = inject(ActivatedRoute);

  get f(): any {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    this.loading = true;
    this.authService.login(this.form.value)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (res.data.passwordExpired) {
            this.authService.temporaryToken = res.meta.temporaryToken;
            this.form.reset();
            this.router.navigate(['/auth', 'new-password'], {}).catch();
          } else {
            this.permissionsService.loadPermissions(res.data.permissions);
            this.tokenService.setTokens(res.meta);
            localStorage.setItem('permissions', JSON.stringify(res.data.permissions));
            this.form.reset();
            this.router.navigate([this.activated.snapshot.queryParams['returnUrl'] || '/']).catch();
          }
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          this.form.setErrors({serverError: res.message});
        }
      });
  }

  trackCaps(event: KeyboardEvent): void {
    if (event && typeof event.getModifierState === 'function') {
      this.capsOn = event.getModifierState('CapsLock');
    }
  }

  changePassShow(): void {
    this.showPassword = !this.showPassword;
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
}
