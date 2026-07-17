import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-bank-detail',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class BankDetailComponent {

  constructor() { }

}
