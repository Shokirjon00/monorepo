import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  CancelOrderModalData,
  CancelOrderModalResult,
  IOrderRefusalReason,
} from '@modules/food/orders/active-orders/interfaces/active-orders.interface';
import { IOrderItem } from '@modules/food/orders/active-orders/interfaces/order.interface';

@Component({
  standalone: true,
  selector: 'em-cancel-order-modal',
  templateUrl: './cancel-order-modal.component.html',
  styleUrls: ['./cancel-order-modal.component.scss'],
  imports: [SvgIconComponent],
})
export class CancelOrderModalComponent {
  private readonly dialogRef = inject(MatDialogRef<CancelOrderModalComponent>);
  private readonly selectedItemsIds = computed(() =>
    new Set(this.selectedItems().map(i => i.productVariantId))
  );
  private readonly NO_POSITION_NAME = 'Нет позиции';
  readonly data = inject<CancelOrderModalData>(MAT_DIALOG_DATA);
  readonly selectedReason = signal<IOrderRefusalReason | null>(null);
  readonly selectedItems = signal<IOrderItem[]>([]);
  readonly isNoPositionReason = computed(() =>
    this.selectedReason()?.name === this.NO_POSITION_NAME
  );
  readonly isConfirmDisabled = computed(() => {
    const reason = this.selectedReason();
    if (!reason) return true;

    return this.isNoPositionReason() && this.selectedItems().length === 0;
  });

  isItemSelected(item: IOrderItem): boolean {
    return this.selectedItemsIds().has(item.productVariantId);
  }

  onSelectReason(reason: IOrderRefusalReason): void {
    this.selectedReason.set(reason);
    if (reason.name !== this.NO_POSITION_NAME) {
      this.selectedItems.set([]);
    }
  }

  onToggleItem(item: IOrderItem): void {
    this.selectedItems.update(items => {
      const exists = items.some(i => i.productVariantId === item.productVariantId);
      return exists
        ? items.filter(i => i.productVariantId !== item.productVariantId)
        : [...items, item];
    });
  }

  onConfirm(): void {
    if (this.isConfirmDisabled()) return;

    this.dialogRef.close({
      confirmed: true,
      reason: this.selectedReason()!,
      items: this.selectedItems(),
    } satisfies CancelOrderModalResult);
  }

  onClose(): void {
    this.dialogRef.close({ confirmed: false } as CancelOrderModalResult);
  }
}
