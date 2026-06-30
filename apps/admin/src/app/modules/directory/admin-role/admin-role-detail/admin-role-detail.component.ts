import {Component} from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-admin-role-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AdminRoleDetailComponent {

  constructor() {
  }

}
