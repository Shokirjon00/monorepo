import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IAction } from '@shared/components/actions/actions.interface';
import { takeUntil } from 'rxjs';
import { CompanyService } from '@modules/client/company/services/company.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICompanyDetail } from '@modules/client/company/interfaces/company-detail.interface';
import { HeaderService } from '@core/services/header.service';
import { CompanyDetailsConstants } from "@modules/client/company/company-detail/company-detail.constants";

@Component({
  standalone: true,
  selector: 'em-company-detail',
  template: '<router-outlet />',
  imports: [RouterOutlet],
  providers: [CompanyService]
})

export class CompanyDetailComponent extends DestroyableComponent implements OnInit, OnDestroy {
  loading: boolean;
  companyDetail: ICompanyDetail;
  private readonly service = inject(CompanyService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly headerService = inject(HeaderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  companyId = this.activatedRoute.snapshot.parent.params['companyId'];
  actions: IAction[] = CompanyDetailsConstants.getAction(this.companyId)

  constructor() {
    super();
    this.headerService.setCompanyId(this.companyId);
  }

  ngOnInit(): void {
    this.getDetail();
  }

  override ngOnDestroy(): void {
    this.headerService.setCompanyId(null);
    super.ngOnDestroy();
  }

  private getDetail(): void {
    this.breadcrumbService.set('@companyDetail', {skip: true});
    this.service.getDetail(this.companyId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.companyDetail = res.data;
          this.headerService.setBankAcquirer(res.data.isEskhataAcquirer);
          this.breadcrumbService.set('@companyDetail', {label: this.companyDetail?.name, skip: false});
        }
      })
  }
}
