import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SvgIconComponent } from 'angular-svg-icon';
import { NotificationSettingsService } from '../services/notification-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum } from '@eskhata/util';
import { EMPTY } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import { finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'em-telegram-connect-modal',
  standalone: true,
  imports: [SvgIconComponent, QRCodeComponent],
  templateUrl: './telegram-connect-modal.component.html',
  styleUrl: './telegram-connect-modal.component.scss',
  providers: [NotificationSettingsService],
})
export class TelegramConnectModalComponent implements OnInit {
  qrCode = signal<string>('');
  telegramLink = signal<string>('');
  loading = signal<boolean>(true);

  private readonly dialogRef = inject(MatDialogRef<TelegramConnectModalComponent>);
  private readonly service = inject(NotificationSettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);

  readonly data = inject(MAT_DIALOG_DATA) as {
    subscriberId?: string;
    telegramLink?: string;
  } | undefined;

  ngOnInit(): void {
    if (this.data?.telegramLink) {
      this.setTelegramLink(this.data.telegramLink);
      return;
    }

    this.createSubscriber();
  }

  close(): void {
    this.dialogRef.close();
  }

  openInTelegram(): void {
    const link = this.telegramLink();
    if (link) {
      window.open(link, '_blank');
    }
  }

  private setTelegramLink(telegramLink: string): void {
    this.telegramLink.set(telegramLink);
    this.qrCode.set(telegramLink);
  }

  private createSubscriber(): void {
    this.loading.set(true);

    this.service
      .getRestaurantPointIds()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((restaurantPointIds) => {
          if (!restaurantPointIds.length) {
            this.showError('Не найдены точки ресторана');
            return EMPTY;
          }

          return this.service.createTelegramSubscriber(restaurantPointIds);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (res.status && res.data?.id) {
            this.setTelegramLink(res.data.telegramLink);
          } else {
            this.showError(res.message || 'Ошибка при создании подписчика');
          }
        },
        error: () => {
          this.showError('Ошибка при создании подписчика');
        },
      });
  }

  private showError(summary: string): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary,
    });
  }
}

