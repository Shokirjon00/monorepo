import { Component, Inject, signal } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ChangeStatusModalData } from "@shared/dialogs/change-status-modal/interfaces/change-status-modal";

@Component({
  selector: 'em-change-status-modal',
  standalone: true,
  imports: [],
  templateUrl: './change-status-modal.component.html',
  styleUrl: './change-status-modal.component.scss'
})
export class ChangeStatusModalComponent {
  statuses: { id: string, name: string }[] = [];
  initialStatusId = '';
  selectedStatus = signal<string>('');

  dropdownStatusOpen = signal<boolean>(false);

  get selectedStatusName(): string {
    return this.statuses.find(s => s.id === this.selectedStatus())?.name ?? 'Выберите статус';
  }

  get isUnchanged(): boolean {
    return (
      this.selectedStatus() === this.initialStatusId
    );
  }


  constructor(
    private dialogRef: MatDialogRef<ChangeStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ChangeStatusModalData
  ) {
    this.statuses = data.statusOptions;
    this.initialStatusId = data.initialValues?.statusId ?? '';

    this.selectedStatus.set(this.initialStatusId);
  }

  toggleStatusDropdown(): void {
    this.dropdownStatusOpen.update(open => !open);
  }

  selectStatus(statusId: string): void {
    this.selectedStatus.set(statusId);
    this.dropdownStatusOpen.set(false);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close({
      selectedStatusId: this.selectedStatus(),
    });
  }
}
