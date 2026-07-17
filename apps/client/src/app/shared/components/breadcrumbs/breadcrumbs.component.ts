import { Component } from '@angular/core';
import { BreadcrumbComponent } from "xng-breadcrumb";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: 'em-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  imports: [
    BreadcrumbComponent,
    AngularSvgIconModule
],
})
export class BreadcrumbsComponent {

  constructor() { }

}
