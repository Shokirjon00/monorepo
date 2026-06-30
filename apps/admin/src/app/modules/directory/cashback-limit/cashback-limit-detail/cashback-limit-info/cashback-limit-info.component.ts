import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { CashbackLimitService } from '@modules/directory/cashback-limit/services/cashback-limit.service';
import { ICashbackLimit } from '@modules/directory/cashback-limit/interfaces/cashback-limit.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-cashback-limit-info',
  templateUrl: './cashback-limit-info.component.html',
  styleUrls: ['./cashback-limit-info.component.scss'],
  providers: [CashbackLimitService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent,
    DateTimePipe
  ]
})
export class CashbackLimitInfoComponent extends DestroyableComponent implements OnInit {
  limitDetail: ICashbackLimit
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CashbackLimitService);
  private cashbackLimitId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getCashbackLimitById(this.cashbackLimitId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.limitDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/cashback-limit/edit', this.cashbackLimitId])
  }
}
