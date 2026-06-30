import { Component } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'em-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  imports: [RouterOutlet]
})
export class TransactionsComponent extends DestroyableComponent {}
