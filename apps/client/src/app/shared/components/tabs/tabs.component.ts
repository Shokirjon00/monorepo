import { Component, input } from '@angular/core';
import { ITab } from '@eskhata/util';

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
