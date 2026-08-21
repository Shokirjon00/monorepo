import { Component, inject, OnInit } from '@angular/core';
import { IRegionDetail } from '@modules/directory/region/interfaces/region-detail.interface';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { RegionService } from '@modules/directory/region/services/region.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-service-info',
  templateUrl: './region-info.component.html',
  styleUrls: ['./region-info.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ],
  providers: [RegionService]
})
export class RegionInfoComponent extends DestroyableComponent implements OnInit {
  regionDetail: IRegionDetail;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(RegionService);
  private regionId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getRegionById(this.regionId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.regionDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/region/edit', this.regionId])
      .catch()
  }
}
