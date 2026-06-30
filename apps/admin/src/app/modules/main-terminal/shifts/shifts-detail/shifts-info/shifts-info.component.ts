import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, WritableSignal, viewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common'
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { IPayment, IPaymentStatusAmount } from "@modules/transactions/payments/interfaces";
import { ShiftsService } from "@modules/main-terminal/shifts/services/shifts.service";
import { ShiftInfoConstants } from "@modules/main-terminal/shifts/shifts-detail/shifts-info/shift-info.constants";
import { ICaption, IFilterParams, IHeader, IPaginate } from "@core/interfaces";
import { TableComponent } from "@shared/components/table/table.component";
import { NgxMaskPipe } from "ngx-mask";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataSourceService } from "@core/services/data-source.service";
import { DateTimePipe } from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-shifts-info',
  templateUrl: './shifts-info.component.html',
  styleUrls: ['./shifts-info.component.scss'],
  imports: [
    CommonModule,
    SvgIconComponent,
    NgxPermissionsModule,
    NgxMaskPipe,
    TableComponent,
    ToastComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    DateTimePipe,
  ],
  providers: [
    ShiftsService,
    DataSourceService
  ]
})
export class ShiftsInfoComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  shiftInfo: IPayment[];
  paymentStatusAmounts: IPaymentStatusAmount[];
  shiftDetail: any;
  columns: ICaption[] = ShiftInfoConstants.SHIFT_INFO_COLUMNS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'shift_info';
  header: IHeader = {
    title: 'Информация',
  };
  loading: WritableSignal<boolean> = signal(false);

  private readonly shiftId: string;
  private readonly service = inject(ShiftsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  constructor() {
    this.shiftId = this.route.snapshot.parent.params['shiftsId'];
  }

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.shiftInfo);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getShiftDetail();
  }

  back(): void {
    this.router.navigate(['/main-terminal/shifts']).catch();
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const parsedParams: Params = parseFilterParams(res, this.queryParams, this.columns);
        if (Object.keys(parsedParams).length) {
          this.getShiftDetail(parsedParams);
        }
      });
  }

  private getShiftDetail(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getShiftDetail(this.shiftId, {
      page: params.page,
      pageSize: params.pageSize,
      filters: params.filters,
      sorts: params.sorts ?? ""
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.shiftInfo = res.data.payments;
          this.paymentStatusAmounts = res.data.paymentStatusAmounts;
          this.paginate = res.meta.pagination;
          this.shiftDetail = res.data;
        }
      });
  }
}
