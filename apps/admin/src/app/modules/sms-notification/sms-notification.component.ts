import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DestroyableComponent } from "@core/abstract/destroyable.component";

@Component({
  standalone: true,
  selector: 'em-sms-notification',
  templateUrl: './sms-notification.component.html',
  styleUrls: ['./sms-notification.component.scss'],
  imports: [
    RouterOutlet,
  ],
  providers: []
})
export class SmsNotificationComponent extends DestroyableComponent {}
