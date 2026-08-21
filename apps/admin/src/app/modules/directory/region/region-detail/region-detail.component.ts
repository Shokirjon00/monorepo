import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-region-detail',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class RegionDetailComponent {

  constructor() { }

}
