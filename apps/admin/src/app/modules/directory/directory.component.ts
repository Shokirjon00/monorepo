import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fader } from '@core/animations/route-transition-animations';

@Component({
  standalone: true,
  selector: 'em-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss'],
  animations: [fader],
  providers: [],
  imports: [RouterModule]
})
export class DirectoryComponent {}
