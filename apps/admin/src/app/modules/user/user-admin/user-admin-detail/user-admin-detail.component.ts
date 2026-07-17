import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-users-log-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class UserAdminDetailComponent{

  constructor() { }

}
