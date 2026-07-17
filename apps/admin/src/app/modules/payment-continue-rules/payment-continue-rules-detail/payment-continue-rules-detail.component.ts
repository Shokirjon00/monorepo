import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-payment-continue-rules-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class PaymentContinueRulesDetailComponent {

  constructor() {
  }

}
