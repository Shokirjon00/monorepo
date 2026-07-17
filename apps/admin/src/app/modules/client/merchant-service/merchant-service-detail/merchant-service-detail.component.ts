import {Component} from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-merchant-services-detail',
  imports: [
    RouterOutlet
  ],
  template: '<router-outlet />'
})
export class MerchantServiceDetailComponent {

  constructor() {}
}
