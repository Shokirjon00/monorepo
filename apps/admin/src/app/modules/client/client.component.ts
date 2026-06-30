import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";


@Component({
  standalone: true,
  selector: 'em-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  imports: [
    RouterOutlet
  ]
})
export class ClientComponent {}
