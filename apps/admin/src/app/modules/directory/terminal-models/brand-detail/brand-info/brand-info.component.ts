import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { BrandService } from '../../services/brand.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmHeaderComponent } from '@eskhata/ui';
import { takeUntil } from 'rxjs';
import {NgxPermissionsModule} from "ngx-permissions";
import {SvgIconComponent} from "angular-svg-icon";
import {IBrandDetail} from "@modules/directory/terminal-models/interfaces/brand-detail.interface";

@Component({
  standalone: true,
  selector: 'em-brand-info',
  templateUrl: './brand-info.component.html',
  styleUrls: ['./brand-info.component.scss'],
  imports: [EmHeaderComponent, NgxPermissionsModule, SvgIconComponent],
  providers: [BrandService]
})
export class BrandInfoComponent extends DestroyableComponent implements OnInit {

  brandDetail: IBrandDetail;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(BrandService);

  private brandId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getBrands(this.brandId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.brandDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/terminal-models/edit', this.brandId])
      .catch()
  }
}

