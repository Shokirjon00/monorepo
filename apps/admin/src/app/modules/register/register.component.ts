import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DestroyableComponent } from "@core/abstract/destroyable.component";

@Component({
  standalone: true,
  selector: 'em-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [RouterOutlet]
})
export class RegisterComponent extends DestroyableComponent {}
