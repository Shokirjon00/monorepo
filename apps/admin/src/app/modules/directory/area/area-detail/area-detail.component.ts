import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-area-detail',
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet]
})
export class AreaDetailComponent {

  constructor() { }

}
