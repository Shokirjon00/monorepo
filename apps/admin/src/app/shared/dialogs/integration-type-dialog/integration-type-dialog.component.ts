import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SimpleSelectListComponent } from '@eskhata/ui';
import { IIntegrationType } from '@modules/client/company/company-detail/integration-setting/interfaces/integration-type';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'em-integration-type-dialog',
  templateUrl: './integration-type-dialog.component.html',
  styleUrls: ['./integration-type-dialog.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SimpleSelectListComponent
  ]
})
export class IntegrationTypeDialogComponent implements OnInit {
  form: FormGroup;
  integrationType: IIntegrationType[];
  selectedIntegrationType: IIntegrationType;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<IntegrationTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IIntegrationType[],
  ) {
    this.integrationType = data;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.fb.group({
      moveId: '',
      isMove: false,
    });
  }

  selectIntegrationType(integrationType: IIntegrationType): void {
    this.selectedIntegrationType = integrationType;
  }

  onSubmit(): void {
    this.dialogRef.close({integrationType: this.selectedIntegrationType?.id, mode: 'update'});
  }

  close(): void {
    this.dialogRef.close();
  }
}
