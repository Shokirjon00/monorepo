import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-commission-detail',
  template: '<router-outlet />',
  imports: [RouterOutlet]
})
export class CommissionDetailComponent {

  constructor() {
  }
}
