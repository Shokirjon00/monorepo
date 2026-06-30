import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IClientRole } from '@modules/directory/client-role/interfaces/client-role.interface';
import { IHeader } from '@core/interfaces/header.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { ClientRoleService } from '@modules/directory/client-role/services/client-role.service';
import { takeUntil } from 'rxjs';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-client-role-info',
  templateUrl: './client-role-info.component.html',
  styleUrls: ['./client-role-info.component.scss'],
  providers: [ClientRoleService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class ClientRoleInfoComponent extends DestroyableComponent implements OnInit {
  clientRoleDetail: IClientRole;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };

  private router = inject(Router);
  private headerService = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);
  private service = inject(ClientRoleService);
  private clientRoleId = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.service.getClientRoleById(this.clientRoleId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.clientRoleDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/client-roles/edit', this.clientRoleId])
      .catch()
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
