import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { IUserRole } from "@modules/directory/user-role/interfaces/user-role.interface";
import { UsersRoleService } from "@modules/directory/user-role/services/users-role.service";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-user-role-info',
  templateUrl: './user-role-info.component.html',
  styleUrls: ['./user-role-info.component.scss'],
  providers: [UsersRoleService],
  imports: [
    SvgIconComponent,
    NgxPermissionsModule,
    EmHeaderComponent
  ]
})
export class UserRoleInfoComponent extends DestroyableComponent implements OnInit {
  clientRoleDetail: IUserRole;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(UsersRoleService);

  private clientRoleId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getClientRoleById(this.clientRoleId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.clientRoleDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/user-roles/edit', this.clientRoleId])
      .catch()
  }
}
