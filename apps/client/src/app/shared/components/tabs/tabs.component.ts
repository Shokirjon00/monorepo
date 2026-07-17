import { Component, input } from '@angular/core';
import { ITab } from '@core/interfaces/header.interface';

import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'em-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [
    RouterModule
]
})
export class TabsComponent {
  readonly tabs = input<ITab[]>();

}
