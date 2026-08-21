import {Component} from '@angular/core';
import {IAction} from '@eskhata/util';
import {ActionEnum} from '@eskhata/util';
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {BreadcrumbsComponent} from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss'],
  imports: [
    RouterOutlet,
    RouterLinkActive,
    RouterLink,
    BreadcrumbsComponent
  ]
})
export class PaymentDetailComponent {

  actions: IAction[] = [
    {
      code: ActionEnum.WITHDRAWAL,
      tooltipName: 'Возврат'
    },
  ]

  constructor() {
  }


}
