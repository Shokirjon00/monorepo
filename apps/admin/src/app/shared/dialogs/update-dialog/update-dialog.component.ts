import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MatDialogRef } from "@angular/material/dialog";
import { IUpdateDialog } from "@shared/dialogs/update-dialog/interface/update-dialog";
import { UploadDialogService } from "@core/services/upload-dialog.service";
import { takeUntil } from "rxjs";
import { DestroyableComponent } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-update-dialog',
  templateUrl: './update-dialog.component.html',
  styleUrls: ['./update-dialog.component.scss'],
  imports: []
})
export class UpdateDialogComponent extends DestroyableComponent implements OnInit, OnDestroy {
  features: IUpdateDialog[];
  loading: boolean;
  private readonly dialogRef = inject(MatDialogRef<UpdateDialogComponent>)
  private readonly service = inject(UploadDialogService)

  ngOnInit(): void {
    this.getData();
  }

  close(): void {
    this.loading = true;
    localStorage.setItem('shouldStartTour', 'true');
    this.dialogRef.close('update');
    window.location.reload();
  }

  private getData(): void {
    this.loading = true;
    this.service.getNewFeatures()
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroyed$)
      )
      .subscribe((res: any) => (this.features = res));
  }

  override ngOnDestroy(): void {
    this.close();
  }
}
