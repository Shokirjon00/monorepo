import { finalize, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { IAction } from '@shared/components/actions/actions.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { MailingService } from '@modules/mailing/services/mailing.service';
import { IMailing } from '@modules/mailing/interfaces/mailing.interface';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { MailingConstants } from "@modules/mailing/mailing.constants";
import { isEmptyObject } from "@core/utils";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";

@Component({
  standalone: true,
  selector: 'em-mailing',
  templateUrl: './mailing.component.html',
  styleUrls: ['./mailing.component.scss'],
  providers: [MailingService],
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    ActionsComponent,
    EMPaginationComponent
  ]
})
export class MailingComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  mailings: IMailing[];
  actions: IAction[] = MailingConstants.MAILING_ACTION
  columns: any = MailingConstants.MAILING_COLUMNS;
  tableActions: IRowAction[] = MailingConstants.TABLE_ACTIONS
  paginate: IPaginate | any;
  captionKey = 'mailings'
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MailingService);
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams()
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.mailings)
  }

  showDetail(mailingId: string): void {
    this.router.navigate(['/mailing', mailingId, 'info']).catch()
  }

  edit(mailingId: string): void {
    this.router.navigate(['/mailing', mailingId, 'edit'])
      .catch()
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getMailing()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.mailings.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private getMailing(params = this.queryParams): void {
    this.loading = true
    this.service.getMailing(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.mailings = res.data
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getMailing(params);
        }
      });
  }
}
