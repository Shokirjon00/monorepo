import { Component, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  standalone: true,
  selector: 'em-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
}
