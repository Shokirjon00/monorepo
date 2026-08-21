import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { CompanyService } from '@modules/client/company/services/company.service';
import { ICompany } from '@modules/client/company/interfaces/company.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { NgxPermissionsService } from 'ngx-permissions';
import { CompanyConstants } from "@modules/client/company/company.constants";
import { ITab } from '@eskhata/util';
import { ClientConstants } from "@modules/client/client.constants";
import { HeaderService } from "@core/services";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-client-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  providers: [CompanyService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent, EbLoaderComponent]
})
export class CompanyComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  captionKey = 'company';
  companies: ICompany[];
  loading: boolean = false;
  columns = CompanyConstants.COMPANY_COLUMNS;
  tableActions: IRowAction[] = CompanyConstants.TABLE_ACTIONS
  actions: IAction[] = CompanyConstants.COMPANY_ACTIONS;
  tabMenuItems: ITab[] = ClientConstants.HEADERS_TABS;
  params: Params = {};
  paginate: IPaginate | any;
  private companySub: Subscription;
  private router = inject(Router);
  private service = inject(CompanyService);
  private store = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private permissionService = inject(NgxPermissionsService);
  private destroyRef = inject(DestroyRef);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.store.setCompanyId(null);
    this.store.setBankAcquirer(null);
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        this.getCompanies(params);
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
    } as ICaption));
    this.table().render(this.columns, this.companies);
  }

  showDetail(id: string): void {
    if (!this.permissionService.getPermission('CompanyDetail')) return;
    this.router.navigate(['clients/company', id]).catch();
  }

  edit(id: string): void {
    this.router.navigate(['clients/company', id, 'edit']).catch()
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getCompanies();
  }

  private getCompanies(params = this.queryParams): void {
    this.loading = true;
    if (this.companySub && !this.companySub.closed) {
      this.companySub.unsubscribe();
    }
    this.companySub = this.service.getCompanies(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.companies = res.data;
          this.paginate = res.meta.pagination;
        }
        this.loading = false
      })
  }
}
