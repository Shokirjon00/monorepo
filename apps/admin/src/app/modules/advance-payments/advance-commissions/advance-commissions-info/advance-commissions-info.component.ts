import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { TableComponent } from "@shared/components/table/table.component";
import { ICommission } from "@modules/directory/commission/interfaces/commission.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { advanceCommissionsInfoColumns } from "@modules/advance-payments/advance-commissions/advance-commissions-info/advance-commissions-info.columns";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AdvanceCommissionsService } from "@modules/advance-payments/advance-commissions/services/advance.commissions.service";

@Component({
  selector: 'em-advance-commissions-info',
  standalone: true,
  imports: [
    DateTimePipe,
    EmHeaderComponent,
    NgxPermissionsModule,
    SvgIconComponent,
    TableComponent
  ],
  templateUrl: './advance-commissions-info.component.html',
  styleUrl: './advance-commissions-info.component.scss'
})
export class AdvanceCommissionsInfoComponent implements OnInit {
  commission: ICommission;
  loading: boolean;
  captions = advanceCommissionsInfoColumns;
  captionKey = 'advance-commission-info';

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(AdvanceCommissionsService);
  private commissionId = this.activatedRoute.snapshot.params['id'];


  ngOnInit(): void {
    this.getCommissionDetail();
  }

  edit(): void {
    this.router.navigate(['advance/advance-commissions/edit', this.commissionId])
      .catch()
  }

  private getCommissionDetail(): void {
    this.service.getCommissionById(this.commissionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.commission = res.data)
  }
}
