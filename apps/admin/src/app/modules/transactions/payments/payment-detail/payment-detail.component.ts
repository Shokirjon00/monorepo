import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastComponent } from "@eskhata/ui";

@Component({
  standalone: true,
  selector: 'em-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss'],
  imports: [RouterModule, ToastComponent]
})
export class PaymentDetailComponent{}
