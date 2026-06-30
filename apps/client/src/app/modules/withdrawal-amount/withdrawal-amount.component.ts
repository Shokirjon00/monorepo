import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount',
  template: '<router-outlet />',
  imports: [
    RouterOutlet
  ],
})
export class WithdrawalAmountComponent {
}
