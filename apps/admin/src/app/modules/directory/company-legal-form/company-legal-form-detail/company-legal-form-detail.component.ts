import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-company-legal-form-detail',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class CompanyLegalFormDetailComponent {

  constructor() {
  }


}
