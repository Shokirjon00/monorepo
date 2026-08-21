import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DestroyableComponent } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [RouterOutlet]
})
export class RegisterComponent extends DestroyableComponent {}
