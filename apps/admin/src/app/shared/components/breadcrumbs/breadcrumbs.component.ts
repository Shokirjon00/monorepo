import { Component } from '@angular/core';
import {AngularSvgIconModule} from 'angular-svg-icon';
import { BreadcrumbComponent } from "xng-breadcrumb";

@Component({
  standalone: true,
  selector: 'em-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  imports: [
    AngularSvgIconModule,
    BreadcrumbComponent
  ],
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {

  constructor() { }

}
