import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import {
  IWithdrawalAmountSettingDetail
} from '@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting-detail.interface';
import {
  WithdrawSetService
} from '@modules/withdrawal-amount/withdrawal-amount-setting/services/withdrawal-amount-setting.service';
import { IHeader } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import {
  withdrawalAmountSettingDetailColumns
} from '@modules/withdrawal-amount/withdrawal-amount-setting/withdrawal-amount-setting-detail/withdrawal-amount-setting-detail.columns';
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from 'ngx-permissions';
import { SvgIconComponent } from 'angular-svg-icon';
import { EmHeaderComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-setting-detail',
  templateUrl: './withdrawal-amount-setting-detail.component.html',
  styleUrls: ['./withdrawal-amount-setting-detail.component.scss'],
  providers: [WithdrawSetService],
  imports: [
    NgxPermissionsAllowStubDirective,
    SvgIconComponent,
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    NgxPermissionsModule,
    ReactiveFormsModule
  ]
})
export class WithdrawalAmountSettingDetailComponent extends DestroyableComponent implements OnInit {
  loading: boolean = false;
  settings: IWithdrawalAmountSettingDetail;
  readonly captions = withdrawalAmountSettingDetailColumns;
  readonly headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  private readonly router = inject(Router);
  private readonly service = inject(WithdrawSetService);
  private readonly headerService = inject(HeaderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly id = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getSettingDetail()
  }

  navigateToUpdate(): void {
    this.router.navigate(['withdrawal-amount/setting/edit', this.id]).catch();
  }

  private getSettingDetail(): void {
    this.loading = true;
    this.service.getDetail(this.id)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        this.settings = res.data;
      });
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
