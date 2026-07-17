import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-account-category-type-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AccountCategoryTypeDetailComponent {

  constructor() {
  }

}
