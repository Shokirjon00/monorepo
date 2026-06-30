import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { AdvancePaymentsPageConstants } from "@modules/advance-payments/advance-payments-page/advance-payments-page.constants";
import { AllowListConstant } from "@modules/advance-payments/allow-list/allow-list.constant";
import { ICaption, IFilterParams, IPaginate, IRowAction } from "@core/interfaces";
import { TableComponent } from "@shared/components/table/table.component";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BankPromotionService } from "@modules/bank-promotion/services/bank-promotion.service";
import { IBankPromotion } from "@modules/bank-promotion/interfaces/bank-promotion.interface";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { AllowListService } from "@modules/advance-payments/allow-list/service/allow-list.service";
import { IAllowList } from "@modules/advance-payments/allow-list/interfaces/allow-list";

@Component({
  selector: 'em-allow-list',
  standalone: true,
  imports: [
    EMPaginationComponent,
    EmHeaderComponent,
    ActionsComponent,
    TableComponent
  ],
  templateUrl: './allow-list.component.html',
  styleUrl: './allow-list.component.scss',
  providers: [BankPromotionService],
})
export class AllowListComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  allowList: IAllowList[];
  tabMenuItems = AdvancePaymentsPageConstants.HEADER_TABS;
  actions = AllowListConstant.ALLOW_LIST_ACTION;
  columns = AllowListConstant.ALLOW_LIST_COLUMNS;
  tableActions :IRowAction[] = AllowListConstant.TABLE_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'allow-list-key';
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private service = inject(AllowListService)
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
   this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.allowList)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getBankPromotion()
  }

  showDetail(allowListId: string): void {
    this.router.navigate(['advance/allow-list/info', allowListId]).catch();
  }

  edit(allowListId: string): void {
    this.router.navigate(['/advance/allow-list/edit', allowListId]);
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.allowList.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private getBankPromotion(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getAdvancePayouts(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.allowList = res.data
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getBankPromotion(params);
        }
      });
  }
}
