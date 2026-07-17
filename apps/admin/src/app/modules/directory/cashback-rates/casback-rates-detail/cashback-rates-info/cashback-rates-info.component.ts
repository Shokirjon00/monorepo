import { Component, inject, OnInit } from '@angular/core';
import { finalize, takeUntil } from 'rxjs';
import { CashbackRatesService } from '@modules/directory/cashback-rates/services/cashback-rates.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICashbackRates } from '@modules/directory/cashback-rates/interfaces/cashback-rates.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IHeader } from '@core/interfaces/header.interface';
import { cashbackRatesInfoColumns } from "@modules/directory/cashback-rates/casback-rates-detail/cashback-rates-info/cashback-rates-info.columns";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { TableComponent } from "@shared/components/table/table.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-cashback-rates-info',
  templateUrl: './cashback-rates-info.component.html',
  styleUrls: ['./cashback-rates-info.component.scss'],
  providers: [CashbackRatesService],
  imports: [
    CommonModule,
    SvgIconComponent,
    TableComponent,
    NgxPermissionsModule,
    EmHeaderComponent,
    DateTimePipe
  ]
})
export class CashbackRatesInfoComponent extends DestroyableComponent implements OnInit {
  loading: boolean;
  cashbackRatesDetail: ICashbackRates;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  captions = cashbackRatesInfoColumns;
  captionKey = 'cashback-rates-info'
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(CashbackRatesService);
  private cashbackRatesId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.loading = true

    this.service.getCashbackById(this.cashbackRatesId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        this.cashbackRatesDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/cashback-rates/edit', this.cashbackRatesId])
      .catch()
  }

}
