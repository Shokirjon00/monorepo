import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { ToastModule } from '@shared/components/toast/toast.module';

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
