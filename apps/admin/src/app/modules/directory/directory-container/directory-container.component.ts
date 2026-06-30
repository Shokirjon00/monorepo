import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  standalone: true,
  selector: 'em-directory-container',
  templateUrl: './directory-container.component.html',
  styleUrls: ['./directory-container.component.scss'],
  imports: [RouterOutlet]
})
export class DirectoryContainerComponent {

  constructor() {
  }
  prepareRoute(outlet: RouterOutlet): RouterOutlet {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation']
  }
}
