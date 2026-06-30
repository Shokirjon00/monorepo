import { Component } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount',
  templateUrl: './withdrawal-amount.component.html',
  styleUrls: ['./withdrawal-amount.component.scss'],
  imports: [
    RouterOutlet
  ]
})
export class WithdrawalAmountComponent extends DestroyableComponent {}
