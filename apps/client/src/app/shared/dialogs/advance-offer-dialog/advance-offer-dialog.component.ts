import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { finalize, timer } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AdvanceOfferService } from "@shared/dialogs/advance-offer-dialog/service/advance-offer.service";

@Component({
  standalone: true,
  selector: 'em-advance-offer-dialog',
  templateUrl: './advance-offer-dialog.component.html',
  styleUrl: './advance-offer-dialog.component.scss',
  providers: [AdvanceOfferService],
  imports: []
})
export class AdvanceOfferDialogComponent {

  private dialogData = inject(MAT_DIALOG_DATA);
  offerData = this.dialogData.data;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  private readonly dialogRef = inject(MatDialogRef<AdvanceOfferDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly service = inject(AdvanceOfferService);

  get formattedAmount(): string {
    if (!this.offerData?.amount) return '';
    return this.offerData.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  onDecline(): void {
    this.getOffer();
    this.dialogRef.close();
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
          const { data, meta } = res;
          sessionStorage.setItem('offerData', JSON.stringify(data));
          if (meta) {
            sessionStorage.setItem('offerMeta', JSON.stringify(meta));
          }
          this.router.navigate(['/advance-payments/conditions']).catch();
          this.dialogRef.close();
        } else {
          this.errorMessage.set(res.message || 'Произошла ошибка. Попробуйте позже.');
        }
      });

  }

  onClose(): void {
    this.dialogRef.close();
  }

  private getOffer(): void {
    this.service.sendLater(this.offerData.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe()
  }
}
