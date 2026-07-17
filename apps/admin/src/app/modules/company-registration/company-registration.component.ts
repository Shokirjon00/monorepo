import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {HeaderService} from "@core/services/header.service";

@Component({
  standalone: true,
  selector: 'em-company-registration',
  templateUrl: './company-registration.component.html',
  styleUrls: ['./company-registration.component.scss'],
  imports: [RouterOutlet],
  providers: [HeaderService]
})
export class CompanyRegistrationComponent {}
