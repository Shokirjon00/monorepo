import {Component} from '@angular/core';
import {RouterModule} from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  imports: [RouterModule]

})
export class UserComponent{}
