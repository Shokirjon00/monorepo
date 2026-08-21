import { Component, inject, OnInit } from '@angular/core';
import {
  IAccountCategoryType
} from '@modules/directory/account-category-type/interfaces/account-category-type.interface';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AccountCategoryTypeService
} from '@modules/directory/account-category-type/services/account-category-type.service';
import { DestroyableComponent } from '@eskhata/util';
import { takeUntil } from 'rxjs';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-account-category-type-info',
  templateUrl: './account-category-type-info.component.html',
  styleUrls: ['./account-category-type-info.component.scss'],
  providers: [AccountCategoryTypeService],
  imports: [NgxPermissionsModule, SvgIconComponent, EmHeaderComponent]
})
export class AccountCategoryTypeInfoComponent extends DestroyableComponent implements OnInit {
  acCatDetail: IAccountCategoryType;
  private readonly router = inject(Router);
  private readonly service = inject(AccountCategoryTypeService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private acCatTyId? = this.activatedRoute.snapshot.parent.params['acTypeId'];

  ngOnInit(): void {
    this.service.getAccountCategoryTypeById(this.acCatTyId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.acCatDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/account-category-type/detail', this.acCatTyId, 'edit'])
      .catch()
  }
}
