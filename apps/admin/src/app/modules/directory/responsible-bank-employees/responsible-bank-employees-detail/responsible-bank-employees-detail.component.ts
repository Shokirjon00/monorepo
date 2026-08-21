import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-responsible-bank-employees-detail',
  template: `
    <router-outlet></router-outlet>`,
  imports: [RouterOutlet]
})
export class ResponsibleBankEmployeesDetailComponent {

  constructor() {
  }

}
