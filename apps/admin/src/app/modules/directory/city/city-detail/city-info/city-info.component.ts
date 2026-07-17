import { Component, inject, OnInit } from '@angular/core';
import { ICityDetail } from '@modules/directory/city/interfaces/city-detail.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { takeUntil } from 'rxjs';
import { CityService } from '@modules/directory/city/services/city.service';
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-city-info',
  templateUrl: './city-info.component.html',
  styleUrls: ['./city-info.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ],
  providers: [CityService]
})
export class CityInfoComponent extends DestroyableComponent implements OnInit {
  cityDetail: ICityDetail;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly service = inject(CityService);
  private cityId = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.service.getCityById(this.cityId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.cityDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/city/edit', this.cityId])
      .catch()
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }

}
