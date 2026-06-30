import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DestroyableComponent } from "@core/abstract/destroyable.component";

@Component({
  standalone: true,
  selector: 'em-list-registration-detail',
  templateUrl: './retail-outlet-detail.component.html',
  styleUrls: ['./retail-outlet-detail.component.scss'],
  imports: [RouterOutlet],
})
export class RetailOutletDetailComponent extends DestroyableComponent {}
