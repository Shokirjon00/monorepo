import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-user-container',
  template: '<router-outlet />',
  imports: [RouterOutlet]
})
export class UserContainerComponent {
  constructor() {
  }
}
