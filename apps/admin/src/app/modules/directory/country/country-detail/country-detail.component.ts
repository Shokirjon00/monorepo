import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-country-detail',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class CountryDetailComponent{

  constructor() { }

}
