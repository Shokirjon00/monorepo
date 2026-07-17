import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-device-type-detail',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class DeviceTypeDetailComponent {

  constructor() { }

}
