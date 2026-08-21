import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DestroyableComponent } from '@eskhata/util';

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
