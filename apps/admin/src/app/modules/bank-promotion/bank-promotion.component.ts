import { finalize, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { IBankPromotion } from '@modules/bank-promotion/interfaces/bank-promotion.interface';
import { BankPromotionService } from '@modules/bank-promotion/services/bank-promotion.service';
import { IAction } from '@shared/components/actions/actions.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { BankPromotionConstants } from "@modules/bank-promotion/bank-promotion.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";

@Component({
  standalone: true,
  selector: 'em-bank-promotion',
  templateUrl: './bank-promotion.component.html',
  styleUrls: ['./bank-promotion.component.scss'],
  imports: [
    TableComponent,
    EMPaginationComponent,
    EbLoaderComponent,
    EmHeaderComponent,
    ActionsComponent,
    ],
  providers: [BankPromotionService]
})
export class BankPromotionComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false)
  bankPromotions: IBankPromotion[];
  actions: IAction[] = BankPromotionConstants.BANK_PROMOTION_ACTION
  columns: any = BankPromotionConstants.BANK_PROMOTION_COLUMNS;
  tableActions: IRowAction[] = BankPromotionConstants.TABLE_ACTIONS
  paginate: IPaginate | any;
  captionKey = 'bank-promotion'
  params: Params = {};

  private readonly service = inject(BankPromotionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        this.getBankPromotion(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.bankPromotions)
  }

  showDetail(bankPromotionId: string): void {
    this.router.navigate(['/bank-promotion', bankPromotionId, 'info']).catch()
  }

  edit(bankPromotionId: string): void {
    this.router.navigate(['/bank-promotion', bankPromotionId, 'edit']).catch()
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getBankPromotion()
  }

  private getBankPromotion(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getBankPromotions(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.bankPromotions = res.data
          this.paginate = res.meta.pagination;
        }
      })
  }
}
