import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-archives-journal-detail',
  template: '<router-outlet />',
  imports: [RouterOutlet]
})
export class JobLogDetailComponent {

  constructor() {
  }
}
