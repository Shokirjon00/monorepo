import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { IHeader } from '@core/interfaces/header.interface';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ServiceService } from "@modules/service/services/service.service";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { CommonModule } from "@angular/common";
import { loadFile } from "@core/utils/load-file";
import { HelperService } from "@core/services/helper.service";
import { IServiceDetail } from "@modules/service/interfaces/service-detail.interface";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-services-info',
  templateUrl: './services-info.component.html',
  styleUrls: ['./services-info.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent,
    CommonModule,
    DateTimePipe
  ],
  providers: [ServiceService]
})
export class ServicesInfoComponent extends DestroyableComponent implements OnInit {
  servicesDetail: IServiceDetail;
  iconId: string;
  loading: boolean;
  header: IHeader = {
    isFilter: true,
    tabShow: false,
    title: 'Информация'
  };

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(ServiceService);
  private readonly helperService = inject(HelperService);
  private readonly serviceId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.loading = true
    this.service.getDetail(this.serviceId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.servicesDetail = res.data;
          if (this.servicesDetail.iconId) this.getUploadLoginMain(res.meta.fileStorageUrl, this.servicesDetail.iconId, res.meta.fileStorageToken);
        }
      });
  }


  navigateToUpdate(): void {
    this.router.navigate(['services/edit', this.serviceId])
      .catch()
  }

  private getUploadLoginMain(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (res: any) => this.iconId = await loadFile(res.body))
  }
}
