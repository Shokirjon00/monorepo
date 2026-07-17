import { Component } from '@angular/core';
import { environment } from '@environments/environment';
import { ITab } from '@core/interfaces/header.interface';

import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-integration-services',
  templateUrl: './integration-service.component.html',
  styleUrls: ['./integration-service.component.scss'],
  imports: [EmHeaderComponent]
})
export class IntegrationServiceComponent {
  tabMenuItems: ITab[]= DirectoryConstants.HEADER_TABS
  services = [
    {image: 'assets/services/rebbit.png', url: environment.rabbitUrl},
    {image: 'assets/services/seq.png', url: environment.seqUrl},
    {image: 'assets/services/hangfire.png', url: environment.hangfireUrl},
    {image: 'assets/services/admin.png', url: environment.adminUrl},
    {image: 'assets/services/client.png', url: environment.clientUrl},
  ];

  constructor() {}
}
