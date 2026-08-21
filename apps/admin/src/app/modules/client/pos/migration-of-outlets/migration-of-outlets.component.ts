import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: 'em-migration-of-outlets',
  templateUrl: './migration-of-outlets.component.html',
  styleUrls: ['./migration-of-outlets.component.scss'],
  imports: [
    AngularSvgIconModule
  ]
})
export class MigrationOfOutletsComponent {
  data = inject<any[]>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<MigrationOfOutletsComponent>);

  migrationData = this.data;

  onClose(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dialogRef.close(true);
  }
}
