import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';

@Injectable()
export class DashboardLoaderService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly message = inject(MessageService);

  private inFlight = 0;
  private errorNotified = signal(false);
  readonly loading = signal(false);

  load<T>(source: Observable<T>, apply: (value: T) => void): void {
    this.inFlight++;
    this.loading.set(true);
    source
      .pipe(
        finalize(() => {
          if (--this.inFlight === 0) {
            this.loading.set(false);
            this.errorNotified.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: apply, error: err => this.notifyError(err) });
  }

  private notifyError(err: unknown): void {
    console.error('Ошибка загрузки блока аналитики:', err);
    if (this.errorNotified()) return;
    this.errorNotified.set(true);
    this.message.add({ severity: ToastEnum.ERROR, summary: 'Не удалось загрузить данные. Попробуйте позже.' });
  }
}
