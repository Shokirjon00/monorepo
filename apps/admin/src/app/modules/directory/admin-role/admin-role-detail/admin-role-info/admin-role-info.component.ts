import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { IAdminRole } from '@modules/directory/admin-role/interfaces/admin-role.interface';
import { AdminRoleService } from '@modules/directory/admin-role/services/admin-role.service';
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-admin-role-info',
  templateUrl: './admin-role-info.component.html',
  styleUrls: ['./admin-role-info.component.scss'],
  providers: [AdminRoleService],
  imports: [SvgIconComponent, EmHeaderComponent, NgxPermissionsModule]
})
export class AdminRoleInfoComponent extends DestroyableComponent implements OnInit {
  adminRoleDetail: IAdminRole;
  private readonly adminRoleId: string;
  private readonly router = inject(Router);
  private readonly service = inject(AdminRoleService);
  private readonly activatedRoute = inject(ActivatedRoute);

  constructor() {
    super();
    this.adminRoleId = this.activatedRoute.snapshot.parent.params['roleId'];
  }

  ngOnInit(): void {
    this.service.getAdminRoleById(this.adminRoleId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.adminRoleDetail = res.data;
        }
      });
  }

  navigate(): void {
    this.router.navigate(['directory/admin-roles/detail', this.adminRoleId, 'edit']).catch();
  }
}
