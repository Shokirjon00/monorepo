import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  imports: [
    RouterOutlet
  ]
})
export class ReportComponent {}
