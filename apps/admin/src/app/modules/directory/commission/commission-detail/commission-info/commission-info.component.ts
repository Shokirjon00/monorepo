import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommissionService } from '@modules/directory/commission/services/commission.service';
import { takeUntil } from 'rxjs/operators';
import { DestroyableComponent } from '@eskhata/util';
import { ICommission } from '@modules/directory/commission/interfaces/commission.interface';
import { commissionInfoColumns } from "@modules/directory/commission/commission-detail/commission-info/commission-info.columns";
import { EmHeaderComponent, TableComponent } from '@eskhata/ui';
import { DateTimePipe } from '@eskhata/util';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-commission-info',
  templateUrl: './commission-info.component.html',
  styleUrls: ['./commission-info.component.scss'],
  providers: [CommissionService],
  imports: [
    TableComponent,
    DateTimePipe,
    SvgIconComponent,
    NgxPermissionsModule,
    EmHeaderComponent
  ]
})
export class CommissionInfoComponent extends DestroyableComponent implements OnInit {
  commission: ICommission;
  loading: boolean;
  captions = commissionInfoColumns;
  captionKey = 'commission-info';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CommissionService);
  private commissionId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.getCommissionDetail();
  }

  edit(): void {
    this.router.navigate(['directory/commission/detail/edit', this.commissionId])
      .catch()
  }

  private getCommissionDetail(): void {
    this.service.getCommissionById(this.commissionId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.commission = res.data)
  }

}
