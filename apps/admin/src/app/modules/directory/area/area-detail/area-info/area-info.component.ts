import { takeUntil } from 'rxjs';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { AreaService } from '@modules/directory/area/services/area.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IAreaDetail } from '@modules/directory/area/interfaces/area-detail.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-area-info',
  templateUrl: './area-info.component.html',
  styleUrls: ['./area-info.component.scss'],
  imports: [
    SvgIconComponent,
    NgxPermissionsAllowStubDirective,
    EmHeaderComponent,
    NgxPermissionsModule
  ],
  providers: [AreaService]
})
export class AreaInfoComponent extends DestroyableComponent implements OnInit {
  areaDetail: IAreaDetail;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  private readonly router = inject(Router);
  private readonly service = inject(AreaService);
  private readonly headerService = inject(HeaderService);
  private readonly activatedRoute  = inject(ActivatedRoute);

  private areaId = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.service.getAreaById(this.areaId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.areaDetail = res.data;
      });
  }

  initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }

  navigateToAreaUpdate(): void {
    this.router.navigate(['directory/area/edit', this.areaId])
      .catch()
  }
}
