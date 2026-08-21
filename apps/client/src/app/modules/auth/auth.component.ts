import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule, ValidatorModule } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    SharedModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    ValidatorModule,
    ToastModule,
    ValidatorModule,
    RouterOutlet,
  ],
})
export class AuthComponent {
  changeImage: boolean;

  constructor() {}
}
