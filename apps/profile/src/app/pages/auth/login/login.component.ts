import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from '@shared-core/data-access/auth.service';
import { finalize, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { DestroyableComponent } from "@core/directives/destroyable.component";
import { RouteEnum } from "@core/enums/route.enum";
import { WhiteSpaceValidator } from "@core/validators/white-space-validator";
import { KeyboardEnum } from '@core/enums/keyboard.enum';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastModule } from '@shared-core/ui/toast/toast.module';
import { ValidatorModule } from '@shared-core/ui/validator/validator.module';
import { SvgIconComponent } from 'angular-svg-icon';
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { LOGIN_PATTERN } from '@shared-core/helper';
import { ToastEnum } from '@core/enums/toast-enum';
import { TokenService } from '@shared-core/data-access/token.service';
import { MessageService } from '@shared-core/data-access/message.service';
import { PreventSpaceDirective } from '@core/select-trugger/space-false.directive';


@Component({
  standalone: true,
  selector: 'em-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    ValidatorModule,
    ToastModule,
    PreventSpaceDirective,
  ],
  providers: [AuthService],
})
export class LoginComponent extends DestroyableComponent implements OnInit {
  form: FormGroup | any;
  capsOn: boolean | undefined;
  loading: boolean | undefined;
  showPassword: boolean | undefined;
  private returnUrl: string | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private activated: ActivatedRoute,
    private messageService: MessageService,
    private permissionsService: NgxPermissionsService
  ) {
    super();
  }

  get f(): any {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.sayHello();
    this.createForm();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const proceedLogin = () => {
      this.authService.login(this.form.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (res) => {
            if (res.status) {
              this.authService.temporaryToken = res.meta.temporaryToken;
              this.getLogin();
            } else {
              this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
            }
          },
          error: () => this.loading = false
        });
    };

    if (!this.authService.temporaryToken) {
      this.authService.hello()
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (res) => {
            if (res.status) {
              this.authService.temporaryToken = res.meta.temporaryToken;
              proceedLogin();
            } else {
              this.loading = false;
            }
          },
          error: () => this.loading = false
        });
    } else {
      proceedLogin();
    }
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
    this.authService
      .hello()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        console.log('HELLO RESPONSE:', res);
        console.log('OLD TOKEN:', this.authService.temporaryToken);
        if (res.status) {
          this.authService.temporaryToken = res.meta.temporaryToken;
          console.log('NEW TOKEN:', this.authService.temporaryToken);
          if (tryLogin) {
            this.onSubmit();
          }
        }
      });
  }


  private createForm(): void {
    this.form = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          WhiteSpaceValidator.validate(),
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(LOGIN_PATTERN),
        ],
      ],
      password: ['', [Validators.required, WhiteSpaceValidator.validate()]],
    });
  }

  private getLogin(): void {
    this.loading = true;
    this.authService
      .getLogin()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.tokenService.setTokens(res.meta);
        // @ts-ignore
        this.permissionsService.loadPermissions(res.data.permissions);
        sessionStorage.setItem(
          'permissions',
          JSON.stringify(res.data.permissions)
        );
        this.router
          .navigate([this.activated.snapshot.queryParams['returnUrl'] || '/'])
          .catch();
      });
  }
}
