import { Component, inject, OnInit } from '@angular/core';
import { ICompanySegment } from '@modules/directory/company-segment/interfaces/company-segment.interface';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanySegmentService } from '@modules/directory/company-segment/services/company-segment.service';
import { takeUntil } from 'rxjs';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-company-segment-info',
  templateUrl: './company-segment-info.component.html',
  styleUrls: ['./company-segment-info.component.scss'],
  providers: [CompanySegmentService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class CompanySegmentInfoComponent extends DestroyableComponent implements OnInit {
  segmentDetail: ICompanySegment;

  private readonly router = inject(Router);
  private readonly service = inject(CompanySegmentService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private segmentId = this.activatedRoute.snapshot.params['segmentId'];

  ngOnInit(): void {
    this.service.getCompanySegmentById(this.segmentId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.segmentDetail = res.data;
      });
  }

  navigate(): void {
    this.router.navigate(['directory/company-segment/edit', this.segmentId])
      .catch()
  }
}
