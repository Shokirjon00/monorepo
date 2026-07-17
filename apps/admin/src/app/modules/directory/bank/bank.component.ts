import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { BankService } from '@modules/directory/bank/services/bank.service';
import { IBank } from '@modules/directory/bank/interfaces/bank.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { BankConstants } from "@modules/directory/bank/bank.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  providers: [BankService],
  imports: [
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})

export class BankComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  banks: IBank[];
  loading: boolean = false;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  paginate: IPaginate;

  readonly columns = BankConstants.BANK_COLUMNS;
  readonly tableActions: IRowAction[] = BankConstants.TABLE_ACTIONS;
  readonly captionKey = 'bank';
  readonly actions: IAction[] = BankConstants.BANK_ACTIONS;
  private params: Params = {};
  private router = inject(Router);
  private service = inject(BankService);
  private route = inject(ActivatedRoute);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getBanks(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({key: x, index: i, isSelected: true} as ICaption));
    this.table().render(this.columns, this.banks)
  }

  detail(bankId: string): void {
    this.router.navigate(['directory/bank/info', bankId]).catch();
  }

  edit(bankId: string): void {
    this.router.navigate(['directory/bank/edit', bankId]).catch();
  }

  settingEdit(id: string): void {
    this.router.navigate(['directory/bank/integration-edit', id]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getBanks();
  }

  private getBanks(params = this.filterParams): void {
    this.loading = true;
    this.service.getBanks(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.banks = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
