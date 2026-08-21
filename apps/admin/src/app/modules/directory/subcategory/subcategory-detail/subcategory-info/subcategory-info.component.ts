import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ISubcategoryDetail } from '@modules/directory/subcategory/interfaces/subcategory-detail.interface';
import { SubcategoryService } from '@modules/directory/subcategory/services/subcategory.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-subcategory-info',
  templateUrl: './subcategory-info.component.html',
  styleUrls: ['./subcategory-info.component.scss'],
  providers: [SubcategoryService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class SubcategoryInfoComponent extends DestroyableComponent implements OnInit {

  subcategoryDetail: ISubcategoryDetail;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(SubcategoryService);

  private subCategoryId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getSubcategoryById(this.subCategoryId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.subcategoryDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/subcategories/edit', this.subCategoryId])
      .catch()
  }
}
