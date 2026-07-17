import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-food',
  templateUrl: './food.component.html',
  styleUrl: './food.component.scss',
  imports: [RouterOutlet]
})
export class FoodComponent {}
