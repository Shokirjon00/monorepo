import { Component, computed, DestroyRef, inject, OnInit, signal, WritableSignal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@modules/auth/service/auth.service";
import { debounceTime, finalize, Observable, takeWhile, timer } from "rxjs";
import { Router } from "@angular/router";
import { MessageService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator, KeyboardEnum } from '@eskhata/util';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { SvgIconComponent } from "angular-svg-icon";
import { SharedModule } from "@shared/shared.module";
import { ToastModule, ValidatorModule } from '@eskhata/ui';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule, RecaptchaSettings } from "ng-recaptcha-2";
import { environment } from "@environments/environment";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import * as CryptoJS from 'crypto-js';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { tap } from "rxjs/operators";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IResetInterface } from "@modules/auth/interfaces/reset.interface";

const globalSettings: RecaptchaSettings = {
  siteKey: environment.captchaSiteKey,
};

@Component({
  standalone: true,
  selector: 'em-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
  imports: [
    SvgIconComponent,
    ReactiveFormsModule,
    SharedModule,
    ValidatorModule,
    ToastModule,
    RecaptchaModule,
    NgxMaskDirective
  ],
  providers: [
    {provide: RECAPTCHA_SETTINGS, useValue: globalSettings},
    provideNgxMask()
  ]
})
export class ResetComponent implements OnInit {
  readonly recaptchaComponent = viewChild<RecaptchaComponent>("recaptcha");
  form: FormGroup;
  userName: string;
  text: string;
  id: string;
  temporaryToken: string | null = null;
  resendVerification: IResetInterface;

  readonly capsOn: WritableSignal<boolean> = signal(false);
  readonly isCaptchaVerified: WritableSignal<boolean> = signal(false);
  readonly captchaResolved: WritableSignal<boolean> = signal(false);
  readonly codeSentSuccess: WritableSignal<boolean> = signal(false);
  readonly isCodeStep: WritableSignal<boolean> = signal(false);
  readonly isPhoneInput: WritableSignal<boolean> = signal(false);
  readonly resendIntervalSeconds: WritableSignal<number> = signal(60);
  readonly canResend: WritableSignal<boolean> = signal(false);
  readonly loading: WritableSignal<boolean> = signal(false);

  private deviceId: string;
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.sayHello();
    this.createForm();
    this.setupPhoneInputListener();
  }

  onSubmit(): void {
    this.loading.set(true);
    this.startCaptchaTimeout();

    if (this.isCodeStep()) {

      if (this.form.get('code')?.invalid) {
        this.loading.set(false);
        return;
      }

      if (this.codeSentSuccess()) {
        this.navigateToLogin();
        return;
      }

      if (!this.authService.temporaryToken) {
        this.sayHello(true);
        return;
      }

      const request$ = this.verifyCodeAndLogin();
      this.handleRequest(request$);
      return;
    }

    if (this.form.invalid || !this.captchaResolved()) {
      this.loading.set(false);
      return;
    }

    if (!this.authService.temporaryToken) {
      this.sayHello(true);
      return;
    }

    const request$ = this.requestLoginCode();
    this.handleRequest(request$);
  }

  resendButtonText = computed(() =>
    this.canResend() ? 'Получить новый код' : `Получить новый код можно через (${this.resendIntervalSeconds()} сек)`
  );

  resendCode(): void {
    if (!this.canResend()) {
      return;
    }
    this.resendVerification = {id: this.id};

    this.authService.setResendVerificationCode(this.resendVerification)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: 'Код отправлен повторно'
          });
          this.startTimer();
        } else {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: res.message
          });
        }
      });
  }

  trackCaps(evt: KeyboardEvent): void {
    if (evt && typeof evt.getModifierState === 'function') {
      if (evt.key === KeyboardEnum.ENTER) {
        evt.preventDefault();
      }
      this.capsOn.set(evt.getModifierState('CapsLock'));
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']).catch();
  }

  onCaptchaResolved(response: string): void {
    this.isCaptchaVerified.set(!!response);
    this.captchaResolved.set(true);
    this.form.get('capchaHash')?.setValue(response);
  }

  private startCaptchaTimeout(): void {
    timer(1000)
      .pipe(
        tap(() => {
          if (this.form.invalid) {
            this.resetCaptcha();
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
  }

  private resetCaptcha(): void {
    this.form.get('capchaHash')?.reset();
    this.recaptchaComponent()?.reset();
  }

  private verifyCodeAndLogin(): Observable<IHttpResponse<IResetInterface>> {
    const hashCode = this.generateHashCode(this.form.value);
    return this.authService.verifyCodeAndLogin({
      id: this.id,
      hashCode
    });
  }

  private requestLoginCode(): Observable<IHttpResponse<IResetInterface>> {
    const formValue = this.form.value;
    let { userName, capchaHash } = formValue;

    const isPhone = this.isPhoneInput();
    if (isPhone) {
      userName = userName.replace(/\D/g, '');
    }

    this.deviceId = localStorage.getItem('device-id') ?? '';

    return this.authService.requestLoginCode(
      {
        userName,
        capchaHash
      },
      this.authService.temporaryToken
    );
  }

  private generateHashCode(formValue: IResetInterface): string {
    const raw = `${formValue.code}:${this.deviceId}:${environment.key}`;
    return CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);
  }

  private navigateToLogin(): void {
    this.router.navigate(['/auth/login']).catch();
  }

  private handleRequest(request$: Observable<any>): void {
    request$
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.handleSuccessResponse(res);
        } else {
          this.handleErrorResponse(res);
        }
      });
  }

  private handleSuccessResponse(res: IResetInterface): void {
    if (!this.isCodeStep()) {
      this.handleInitialLoginStep(res);
    } else {
      this.handleCodeStepSuccess(res);
    }
  }

  private handleInitialLoginStep(res: any): void {
    this.authService.temporaryToken = res?.meta.temporaryToken;
    this.isCodeStep.set(true);
    this.id = res.data.id;
    this.userName = res.data.userName;
    this.text = res.data.text;
    this.resendIntervalSeconds.set(res.data.resendIntervalSeconds ?? 60);
    this.form.get('code')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('code')?.updateValueAndValidity();
    this.startTimer();
  }

  private handleCodeStepSuccess(res: any): void {
    this.codeSentSuccess.set(true);
    this.text = res.data.text;
    this.userName = res.data.userName;
  }

  private handleErrorResponse(res: any): void {
    this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
    setValidationErrors(this.form, res);
  }

  private startTimer(): void {
    this.resendIntervalSeconds.set(60);
    this.canResend.set(false);

    timer(0, 1000).pipe(
      tap(() => this.resendIntervalSeconds.update(v => v - 1)),
      takeWhile(() => this.resendIntervalSeconds() > 0),
      finalize(() => this.canResend.set(true)))
      .subscribe();
  }

  private sayHello(tryLogin = false): void {
    this.authService.hello()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.authService.temporaryToken = res.meta?.temporaryToken;

          if (res.device?.codeUid) {
            this.deviceId = res.device.codeUid;

            if (tryLogin) {
              this.onSubmit();
            }
          }
        }
      });
  }

  private setupPhoneInputListener(): void {
    this.form.get('userName')?.valueChanges
      .pipe(
        debounceTime(100),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value: string) => {
        const control = this.form.get('userName');
        if (!control) return;
        const onlyNumbers = value.replace(/\D/g, '');
        const isPhone = value.startsWith('+992') || onlyNumbers.startsWith('992');
        this.isPhoneInput.set(isPhone);
        const validators = [
          Validators.required,
          WhiteSpaceValidator.validate()
        ];
        if (isPhone) {
          validators.push(Validators.minLength(12), Validators.maxLength(19));
        } else {
          validators.push(Validators.minLength(3), Validators.maxLength(50));
        }
        control.setValidators(validators);
        control.updateValueAndValidity({ emitEvent: false });
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      userName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.minLength(3),
        Validators.maxLength(100)]],
      capchaHash: ['', Validators.required],
      code: ['', [Validators.minLength(6), Validators.maxLength(6)]]
    });
  }
}
