import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'em-job-log',
  templateUrl: './main-terminal.html',
  imports: [
    RouterOutlet,
  ],
  providers: []
})

export class MainTerminal {}
