import { Component } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
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
