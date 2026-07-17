import {Component} from '@angular/core';
import {IAction} from "@shared/components/actions/action.interface";
import {ActionEnum} from "@core/enums/action-enum";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {BreadcrumbsComponent} from "@shared/components/breadcrumbs/breadcrumbs.component";

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
