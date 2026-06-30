import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Observable, timer } from "rxjs";
import { tap } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { CodeService } from "@shared/dialogs/code-modal/code/code.service";
import { MessageService } from "@core/services/message.service";
import { ToastEnum } from "@core/enums/toast-enum";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IResetInterface } from "@modules/auth/interfaces/reset.interface";
import { environment } from "@environments/environment";
import * as CryptoJS from "crypto-js";
import { ToastModule } from "@shared/components/toast/toast.module";

@Component({
  selector: 'em-code-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ToastModule
  ],
  templateUrl: './code-modal.component.html',
  styleUrl: './code-modal.component.scss'
})
export class CodeModalComponent implements OnInit {
  codeForm: FormGroup;
  message: string;
  deviceId = localStorage.getItem('device-id') ?? '';

  canResend = signal(false);
  resendIntervalSeconds = signal(60);
  codeSubmitted = signal(false);
  resendButtonText = computed(() =>
    this.canResend() ? 'Получить новый код' : `Получить новый код через (${this.resendIntervalSeconds()} сек)`
  );

  private timerSubscription: any;
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CodeService);
  private readonly dialogRef = inject(MatDialogRef<CodeModalComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  readonly data = inject(MAT_DIALOG_DATA) as {
    id: string;
    maskedPhoneNumber: string;
    resendIntervalSeconds: number;
    advancePayoutId: string;
  };

  ngOnInit(): void {
    this.startTimer(this.data.resendIntervalSeconds || this.resendIntervalSeconds());
    this.createForm();
  }

  submitCode(): void {
    if (this.codeForm.invalid) return;

    this.verifyCodeAndLogin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        res => {
          if (res.status) {
            this.message = res.data.text;
            this.codeSubmitted.set(true);
            this.stopTimer();
          } else {
            this.messageService.add({
              severity: ToastEnum.ERROR,
              summary: res.message
            });
          }
        },
        () => {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: 'Ошибка при подтверждении кода'
          });
        }
      );
  }

  close(): void {
    this.router.navigate(['/advance-payments']).catch();
    this.dialogRef.close();
  }

  resendCode(): void {
    if (!this.canResend()) return;
    this.sendResendRequest();
    this.startTimer(this.data.resendIntervalSeconds || this.resendIntervalSeconds());
  }

  private verifyCodeAndLogin(): Observable<IHttpResponse<IResetInterface>> {
    const hashCode = this.generateHashCode(this.codeForm.value);
    return this.service.sendCode({
      advancePayoutId: this.data.advancePayoutId,
      id: this.data.id,
      hashCode
    });
  }

  private generateHashCode(formValue: IResetInterface): string {
    const raw = `${formValue.code}:${this.deviceId}:${environment.key}`;
    return CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);
  }

  private createForm(): void {
    this.codeForm = this.fb.group({
      code: ['',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^\d{6}$/)
        ]
      ],
    });
  }

  private sendResendRequest(): void {
    this.service.resetCode(this.data.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: 'Код отправлен повторно'
          });
          this.startTimer(this.data.resendIntervalSeconds || this.resendIntervalSeconds());
        } else {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: res.message
          });
        }
      })
  }

  private startTimer(seconds: number): void {
    this.stopTimer();

    this.resendIntervalSeconds.set(seconds);
    this.canResend.set(false);

    this.timerSubscription = timer(1000, 1000).pipe(
      tap(() => {
        const current = this.resendIntervalSeconds();
        if (current > 1) {
          this.resendIntervalSeconds.set(current - 1);
        } else {
          this.resendIntervalSeconds.set(0);
          this.canResend.set(true);
          this.stopTimer();
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
