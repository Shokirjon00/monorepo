import { Component, inject, OnInit } from "@angular/core";
import { OrderService } from "@modules/order/services/order.service";
import { ITab } from '@eskhata/util';
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { OrderDetailConstants } from "@modules/order/order-detail/order-detail.constants";
import { ToastComponent } from "@eskhata/ui";

@Component({
  standalone: true,
  selector: 'em-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  imports: [
    RouterOutlet,
    ToastComponent
  ],
  providers: [OrderService]
})
export class OrderDetailComponent implements OnInit {
  protected orderId: string;
  tabMenuItems: ITab[]
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.orderId = this.route.snapshot.parent?.params['id'];
    this.tabMenuItems = OrderDetailConstants.getHeaderTabs(this.orderId);
  }
}
