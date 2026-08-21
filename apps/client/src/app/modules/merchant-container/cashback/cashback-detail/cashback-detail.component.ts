import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ICashback } from '@modules/merchant-container/cashback/interfaces/cashback.interface';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { CashbackService } from '@modules/merchant-container/cashback/services/cashback.service';
import { SvgIconComponent } from 'angular-svg-icon';
import { EmHeaderComponent } from '@eskhata/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTimePipe } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-cashback-company-detail',
  templateUrl: './cashback-detail.component.html',
  styleUrls: ['./cashback-detail.component.scss'],
  imports: [SvgIconComponent, DatePipe, EmHeaderComponent, DateTimePipe],
  providers: [CashbackService],
})
export class CashbackDetailComponent implements OnInit {
  cashbackDetail: ICashback;
  private readonly cashbackId: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  private readonly service = inject(CashbackService);
  private readonly activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.cashbackId = this.activatedRoute.snapshot.params['cashbackId'];
  }

  ngOnInit(): void {
    this.getDetail();
  }

  getDetail(): void {
    this.service
      .getCashbackCompanyById(this.cashbackId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.cashbackDetail = res.data;
        }
      });
  }

  back(): void {
    this.location.back();
  }
}
