import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-directory-options-edit',
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet]
})
export class DirectoryOptionsDetailComponent {}
