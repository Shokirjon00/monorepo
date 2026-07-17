import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-merchant-container',
  template: '<router-outlet />',
  imports: [
    RouterOutlet,
  ]
})
export class MerchantContainerComponent {
}
