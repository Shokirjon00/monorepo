import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import {
  CompanyRegistrationApplicationsService
} from "@modules/company-registration/list-registration/services/company-registration.service";
import { ICaption, IRowAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { IFilterParams } from '@eskhata/util';
import { HeaderService } from "@core/services/header.service";
import { finalize, takeUntil } from "rxjs";
import { parseFilterParams } from "@core/utils/filter-util";
import {
  ICompanyRegistration
} from "@modules/company-registration/list-registration/interfaces/company-registration.interfaces";
import { DestroyableComponent } from '@eskhata/util';
import { setDefaultFilterValue } from '@eskhata/util';
import { ListRegistrationConstants } from "@modules/company-registration/list-registration/list-registration.constants";
import { ITab } from '@eskhata/util';
import { CompaniesRegistrationConstanta } from "@modules/company-registration/company-registration.constants";

@Component({
  standalone: true,
  selector: 'em-list-registration',
  templateUrl: './list-registration.component.html',
  styleUrls: ['./list-registration.component.scss'],
  providers: [CompanyRegistrationApplicationsService],
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    EmHeaderComponent,
    EMPaginationComponent
  ]
})
export class ListRegistrationComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  companyRegistration: ICompanyRegistration[];
  columns = ListRegistrationConstants.LIST_REGISTRATION_COLUMNS;
  tableActions: IRowAction[] = ListRegistrationConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = CompaniesRegistrationConstanta.HEADERS_TABS;
  captionKey = 'company-registration';
  paginate: IPaginate | any;
  params: Params = {};

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(CompanyRegistrationApplicationsService);
  private store = inject(HeaderService);

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
        this.getCompanyRegistration(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();

      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.companyRegistration);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCompanyRegistration()
  }

  showDetail(listId: string): void {
    this.router.navigate(['company-registration-applications/list-registration/detail/', listId]).catch();
  }

  edit(edit: string): void {
    this.router.navigate([`company-registration-applications/list-registration/edit`, edit]).catch();
  }

  private getCompanyRegistration(params = this.filterParams): void {
    this.loading = true;
    this.service.getCompanyRegistration(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.companyRegistration = res.data;
          this.paginate = res.meta.pagination;
          this.store.setPage(this.paginate);
        }
      })
  }
}
