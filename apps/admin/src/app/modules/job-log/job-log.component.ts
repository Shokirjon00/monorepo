import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DestroyableComponent } from "@core/abstract/destroyable.component";

@Component({
  standalone: true,
  selector: 'em-job-log',
  templateUrl: './job-log.component.html',
  styleUrls: ['./job-log.component.scss'],
  imports: [
    RouterOutlet,
  ],
  providers: []
})
export class JobLogComponent extends DestroyableComponent {}
