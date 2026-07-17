import {Component} from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-account-type-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AccountTypeDetailComponent {

  constructor() {
  }

}
