import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SimpleSelectListComponent } from '@eskhata/ui';

@Component({
  selector: 'em-change-order-status',
  templateUrl: './change-order-status.component.html',
  standalone: true,
  imports: [
    SimpleSelectListComponent
  ],
  styleUrls: ['./change-order-status.component.scss']
})
export class ChangeOrderStatusComponent {
  orderStatus = [
    {id: 'ecacef42-fdf0-4398-b622-1f92c626cc7a', name: 'Исполнено'},
    {id: 'fe360a16-e2ed-4478-9c29-5411a1bb7e54', name: 'Отменено'}
  ];
  selectedStatusId: string;

  private readonly dialogRef = inject(MatDialogRef<ChangeOrderStatusComponent>);

  selectOrderStatus(status: {id: string, name: string}): void {
    this.selectedStatusId = status?.id;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedStatusId) {
      this.dialogRef.close({statusId: this.selectedStatusId});
    }
  }
}
