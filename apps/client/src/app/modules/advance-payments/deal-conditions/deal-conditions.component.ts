import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { PdfDialogComponent } from "@shared/dialogs/pdf-dialog/pdf-dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { HelperService } from '@eskhata/data-access';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CodeModalComponent } from "@shared/dialogs/code-modal/code-modal.component";
import { Router } from "@angular/router";
import { OfferService } from "@modules/advance-payments/deal-conditions/service/offer.service";
import { finalize } from "rxjs/operators";
import { ToastEnum } from '@eskhata/util';
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { MessageService } from '@eskhata/data-access';
import { loadFile } from "@core/utils/load-file";

import { ToastModule } from "@eskhata/ui";
import { IOffer } from "@modules/advance-payments/deal-conditions/interface/offer";
import { ICondition } from "@modules/advance-payments/deal-conditions/interface/condition";

@Component({
  standalone: true,
  selector: 'em-deal-conditions',
  templateUrl: './deal-conditions.component.html',
  styleUrl: './deal-conditions.component.scss',
  imports: [ReactiveFormsModule, ToastModule],
  providers: [OfferService]
})

export class DealConditionsComponent implements OnInit {
  submitted = false;
  isLoadingPdf = false;
  fileStorageUrl!: string;
  fileStorageToken!: string;
  conditions: ICondition[] = [];
  form: FormGroup;
  offerData: IOffer;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly service = inject(OfferService);
  private readonly helperService = inject(HelperService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.form = this.fb.group({
      confirmPolicy: [false, Validators.requiredTrue]
    });
    this.loadOfferDataFromSession();
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('ru-RU');
  }

  showPdfDocument(): void {
    if (!this.canShowPdf()) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Отсутствует файл договора' });
      return;
    }

    this.loadAndShowPdf();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.value,
      advancePayoutId: this.offerData?.advancePayoutId
    };


    this.service.send(payload)
        .pipe(
            finalize(() => this.submitted = false),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(res => {
          if (res.status) {
            const {id, maskedPhoneNumber, resendIntervalSeconds, advancePayoutId} = res.data;
            this.dialog.open(CodeModalComponent, {
              width: '420px',
              panelClass: 'custom-dialog',
              disableClose: true,
              data: {id, maskedPhoneNumber, resendIntervalSeconds, advancePayoutId}
            });
          } else {
            this.form.get('confirmPolicy')?.setValue(false);
            this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
            setValidationErrors(this.form, res);
          }
        });
  }

  onCancel(): void {
    this.router.navigate(['/advance-payments']).catch();
  }

  private canShowPdf(): boolean {
    return !!(this.fileStorageUrl && this.fileStorageToken && this.offerData?.fileId);
  }

  private loadAndShowPdf(): void {
    const dialogRef = this.openPdfDialog();

    this.helperService.getFile(this.fileStorageUrl, this.offerData.fileId, this.fileStorageToken)
      .pipe(
        finalize(() => this.isLoadingPdf = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(async (res: any) => {
        const dataUrl = await loadFile(res.body);
        dialogRef.componentInstance.data = dataUrl;
      });
  }

  private openPdfDialog(): MatDialogRef<PdfDialogComponent> {
    return this.dialog.open(PdfDialogComponent, {
      panelClass: 'custom-modalbox',
      width: '80vw',
      height: '90vh',
      disableClose: true
    });
  }

  private setConditionsFromOfferData(): void {
    this.conditions = [
      {text: 'Банк выдаст вам аванс в размере', bold: this.formatNumber(this.offerData.amount) + ' сомони'},
      {text: 'Эквайринговая комиссия на время действия аванса увеличится на', bold: this.offerData.percent + '%'},
      {text: 'Погашение аванса будет за счет QR платежей'},
      {text: 'Аванс подлежит погашению в течение', bold: this.offerData.days + ' дней'}
    ];
  }

  private loadOfferDataFromSession(): void {
    const dataStr = sessionStorage.getItem('offerData');
    const metaStr = sessionStorage.getItem('offerMeta');

    const meta = metaStr ? JSON.parse(metaStr) : null;

    if (dataStr) {
      this.offerData = JSON.parse(dataStr);
      this.setConditionsFromOfferData();
    }

    if (meta) {
      this.fileStorageUrl = meta.fileStorageUrl;
      this.fileStorageToken = meta.fileStorageToken;
    }
  }

}
