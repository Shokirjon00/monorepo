import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { HeaderService } from '@core/services/header.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { CommissionCompanyService } from "@modules/client/company/company-detail/commission-company/services/commission-company.service";
import { ICommissionCompany } from "@modules/client/company/company-detail/commission-company/interfaces/commission-company.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-commission-company-info',
  templateUrl: './commission-company-info.component.html',
  styleUrls: ['./commission-company-info.component.scss'],
  providers: [CommissionCompanyService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent,
    ToastComponent,
    DateTimePipe
  ]
})
export class CommissionCompanyInfoComponent extends DestroyableComponent implements OnInit {
  companyId: string;
  commissionDetail: ICommissionCompany;

  private readonly router = inject(Router);
  private readonly service = inject(CommissionCompanyService);
  private readonly headerService = inject(HeaderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly commissionCompanyId = this.activatedRoute.snapshot.params['id'];
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  readonly loading: WritableSignal<boolean> = signal(false);

  commissionNamesList: string = '-';
  bankNamesList: string = '-';
  bankCommissionPairs: string = '-';

  ngOnInit(): void {
    this.headerService.getCompanyId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((companyId: string) => this.companyId = companyId);
    this.getDetail();
  }

  navigate(id: string): void {
    this.loading.set(true);
    this.service.getCommissionCompanyDetail(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.router.navigate([`clients/company/${this.companyId}/commission/edit`, id]).catch();
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }

  private getDetail(): void {
    this.service.getCommissionCompanyById(this.commissionCompanyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.commissionDetail = res.data;
        const items = this.commissionDetail?.bankCommissionNames;
        if (items && items.length) {
          this.commissionNamesList = items.map(i => i?.commissionName ?? '-').join(', ');
          this.bankNamesList = items.map(i => i?.bankName ?? '-').join(', ');
          this.bankCommissionPairs = items.map(i => `${i?.bankName ?? '-'} — ${i?.commissionName ?? '-'}`).join(', ');
        } else {
          this.commissionNamesList = '-';
          this.bankNamesList = '-';
          this.bankCommissionPairs = '-';
        }
      })
  }
}
