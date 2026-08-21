import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { CategoryService } from '@modules/directory/category/services/category.service';
import { ICategoryDetail } from '@modules/directory/category/interfaces/category-detail.interface';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-category-info',
  templateUrl: './category-info.component.html',
  styleUrls: ['./category-info.component.scss'],
  providers: [CategoryService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class CategoryInfoComponent extends DestroyableComponent implements OnInit {
  categoryDetail: ICategoryDetail;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(CategoryService);

  private categoryId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getCategoryById(this.categoryId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.categoryDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/categories/edit', this.categoryId])
      .catch()
  }
}
