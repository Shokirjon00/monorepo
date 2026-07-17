import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AdvanceOfferService } from "@shared/dialogs/advance-offer-dialog/service/advance-offer.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { Router } from "@angular/router";
import { bannerAmountSignal } from "@shared/components/banner/banner-signal";
import { IBanner } from "@shared/components/banner/interface/banner";
import { AlertDialogComponent } from "@shared/dialogs/alert-dialog/alert-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  standalone: true,
  selector: 'em-banner',
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  imports: [],
  providers: [AdvanceOfferService]
})

export class BannerComponent {
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  private readonly service = inject(AdvanceOfferService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  get amount(): IBanner {
    return bannerAmountSignal();
  }

  get formattedAmount(): string {
    if (!this.amount.amount) return '';
    return this.amount.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  onAccept(): void {
    this.loading.set(true);
    this.service.check()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        if (res.status) {
          const {data, meta} = res;
          sessionStorage.setItem('offerData', JSON.stringify(data));
          if (meta) {
            sessionStorage.setItem('offerMeta', JSON.stringify(meta));
          }
          this.router.navigate(['/advance-payments/conditions']).catch();
        } else {
          this.dialog.open(AlertDialogComponent, {
            data: {
              title: res.message,
              btnText: 'Закрыть'
            },
            maxWidth: '90vw'
          });

        }
      });
  }

}
