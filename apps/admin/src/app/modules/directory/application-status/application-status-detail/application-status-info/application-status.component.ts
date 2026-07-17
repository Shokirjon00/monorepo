import {Component, DestroyRef, inject, OnInit} from '@angular/core';
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
import {IMerchantApplicationDetail} from "@modules/directory/application-status/interfaces/city-detail.interface";
import {ApplicationStatusService} from "@modules/directory/application-status/services/application-status.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DateTimePipe} from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-application-status-info',
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent,
    DateTimePipe
  ],
  providers: [ApplicationStatusService]
})
export class ApplicationStatusInfoComponent implements OnInit {
  merchantApplicationStatusDetail: IMerchantApplicationDetail;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  private service = inject(ApplicationStatusService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private applicationStatusId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.initData();
    this.service.getMerchantApplicationStatusById(this.applicationStatusId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.merchantApplicationStatusDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/application-status/edit', this.applicationStatusId])
      .catch()
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }

}
