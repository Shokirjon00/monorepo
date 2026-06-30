import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-working-day-detail',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class WorkingDayDetailComponent {

  constructor() { }

}
