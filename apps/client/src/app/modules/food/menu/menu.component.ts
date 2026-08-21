import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-menu',
  template: '<router-outlet />',
  imports: [RouterOutlet]
})
export class MenuComponent {

}
