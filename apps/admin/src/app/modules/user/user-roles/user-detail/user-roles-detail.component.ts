import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-user-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class UserRolesDetailComponent {

  constructor() {
  }

}
