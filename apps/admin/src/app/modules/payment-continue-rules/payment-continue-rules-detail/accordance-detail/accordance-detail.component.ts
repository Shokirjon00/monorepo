import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-accordance-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AccordanceDetailComponent {

  constructor() {
  }

}
