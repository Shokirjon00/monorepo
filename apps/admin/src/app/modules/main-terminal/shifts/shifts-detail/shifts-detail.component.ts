import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-shits-detail',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class ShiftsDetailComponent {}
