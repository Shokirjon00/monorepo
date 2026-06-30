import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  imports: [
    RouterOutlet
  ],
})
export class UserDetailComponent {}
