import { Component, Input } from '@angular/core';
import { IAccount } from "@modules/merchant-container/account/interfaces/account.interface";

@Component({
  selector: 'em-account-mobile-card',
  standalone: true,
  imports: [],
  templateUrl: './account-mobile-card.component.html',
  styleUrl: './account-mobile-card.component.scss'
})
export class AccountMobileCardComponent {
  @Input()  account: IAccount;
}
