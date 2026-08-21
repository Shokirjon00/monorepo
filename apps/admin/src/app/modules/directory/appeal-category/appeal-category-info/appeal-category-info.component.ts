import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { EmHeaderComponent } from '@eskhata/ui';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from "@angular/router";
import { AppealCategoryService } from "@modules/directory/appeal-category/services/appeal-category.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IAppealCategoryDetail } from "@modules/directory/appeal-category/interfaces/appeal-category-detail.interface";

@Component({
  selector: 'em-appeal-category-info',
  standalone: true,
  imports: [
    EmHeaderComponent,
    NgxPermissionsModule,
    SvgIconComponent
  ],
  templateUrl: './appeal-category-info.component.html',
  styleUrl: './appeal-category-info.component.scss',
  providers:[AppealCategoryService]
})
export class AppealCategoryInfoComponent extends DestroyableComponent implements OnInit {
  categoryDetail: IAppealCategoryDetail;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private service = inject(AppealCategoryService);
  private readonly destroyRef = inject(DestroyRef);

  private categoryId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getCategoryById(this.categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.categoryDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/appeal-category/edit', this.categoryId])
      .catch()
  }
}
