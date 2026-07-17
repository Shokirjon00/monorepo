import { Component, inject, OnInit } from '@angular/core';
import { IBranchDetail } from '@modules/directory/branch/interfaces/branch-detail.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { takeUntil } from 'rxjs';
import { BranchService } from '@modules/directory/branch/services/branch.service';
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-branch-info',
  templateUrl: './branch-info.component.html',
  styleUrls: ['./branch-info.component.scss'],
  providers: [BranchService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class BranchInfoComponent extends DestroyableComponent implements OnInit {
  branchDetail: IBranchDetail;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private service = inject(BranchService);

  private branchId = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.service.getBranchById(this.branchId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.branchDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/branch/edit', this.branchId])
      .catch()
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
