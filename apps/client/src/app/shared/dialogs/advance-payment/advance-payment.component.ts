import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { MainFilterComponent } from "@shared/dialogs/main-filter/main-filter.component";
import { Router } from "@angular/router";
import { ADVANCE_PAYMENT_CONTENT } from "@shared/dialogs/advance-payment/advance-payment.constants";
import { IAdvancePaymentContent } from "@shared/dialogs/advance-payment/interface/advance-payment";

@Component({
  standalone: true,
  selector: 'em-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrl: './advance-payment.component.scss',
  imports: []
})
export class AdvancePaymentComponent implements OnInit{
  content: IAdvancePaymentContent = ADVANCE_PAYMENT_CONTENT;
  cleanedParagraph1: string;
  cleanedParagraph2: string;

  private readonly modalRef = inject(MatDialogRef<MainFilterComponent>);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.prepareCleanedParagraphs();
  }

  onCancel(): void {
    this.router.navigate(['/analytics']).catch();
    this.modalRef.close();
  }

  private prepareCleanedParagraphs(): void {
    this.cleanedParagraph1 = this.content.paragraphs[1]
      .replace(this.content.highlights[0], '')
      .trim();

    this.cleanedParagraph2 = this.content.paragraphs[2]
      .replace(this.content.highlights[1], '')
      .trim();
  }
}
