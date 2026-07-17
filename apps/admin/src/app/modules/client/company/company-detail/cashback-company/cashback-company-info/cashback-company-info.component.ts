import { Component, inject, OnInit } from '@angular/core';
import { ICashbackCompany } from '@modules/client/company/company-detail/cashback-company/interfaces/cashback-company.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { takeUntil } from 'rxjs';
import { CashbackCompanyService } from '@modules/client/company/company-detail/cashback-company/services/cashback-company.service';
import { HeaderService } from '@core/services/header.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgClass } from "@angular/common";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-cashback-company-info',
  templateUrl: './cashback-company-info.component.html',
  styleUrls: ['./cashback-company-info.component.scss'],
  providers: [CashbackCompanyService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent,
    NgClass,
    DateTimePipe
  ]
})
export class CashbackCompanyInfoComponent extends DestroyableComponent implements OnInit {
  companyId: string;
  cashbackDetail: ICashbackCompany;
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CashbackCompanyService);
  private headerService = inject(HeaderService);
  private cashbackCompanyId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.headerService.getCompanyId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((companyId: string) => this.companyId = companyId);
    this.getDetail();
  }

  navigate(): void {
    this.router.navigate([`clients/company/${this.companyId}/cashback/edit`, this.cashbackCompanyId])
      .catch();
  }

  private getDetail(): void {
    this.service.getCashbackCompanyById(this.cashbackCompanyId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.cashbackDetail = res.data;
      })
  }

}
