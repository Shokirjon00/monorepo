import {AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild} from '@angular/core';
import { EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import {
  CompanyRegistrationApplicationsService
} from "@modules/company-registration/list-registration/services/company-registration.service";
import {ICaption, IRowAction} from '@eskhata/util';
import {IPaginate} from '@eskhata/util';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {IFilterParams} from '@eskhata/util';
import {HeaderService} from "@core/services/header.service";
import {finalize} from "rxjs";
import {parseFilterParams} from "@core/utils/filter-util";
import {
  ICompanyRegistration
} from "@modules/company-registration/list-registration/interfaces/company-registration.interfaces";
import {setDefaultFilterValue} from '@eskhata/util';
import {ITab} from '@eskhata/util';
import {CompaniesRegistrationConstanta} from "@modules/company-registration/company-registration.constants";
import {RetailOutletConstants} from "@modules/company-registration/retail-outlet/retail-outlet.constants";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RetailOutletService} from "@modules/company-registration/retail-outlet/services/retail-outlet.service";
import {MatDialog} from "@angular/material/dialog";
import {
  RetailOutletDialogComponent
} from "@modules/company-registration/retail-outlet/retail-outlet-detail/retail-outlet-dialog/retail-outlet-dialog.component";

@Component({
  standalone: true,
  selector: 'em-list-registration',
  templateUrl: './retail-outlet.component.html',
  styleUrls: ['./retail-outlet.component.scss'],
  providers: [CompanyRegistrationApplicationsService],
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    EmHeaderComponent,
    EMPaginationComponent
  ]
})
export class RetailOutletComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  retailOutlet: ICompanyRegistration[];
  columns = RetailOutletConstants.RETAIL_OUTING_COLUMNS;
  tableActions: IRowAction[] = RetailOutletConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = CompaniesRegistrationConstanta.HEADERS_TABS;
  captionKey = 'company-registration';
  paginate: IPaginate | any;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RetailOutletService);
  private readonly store = inject(HeaderService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dialog = inject(MatDialog);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getRetailOutlet(params);
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
    this.table().render(this.columns, this.retailOutlet);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getRetailOutlet();
  }

  showDetail(retailOutletId: string): void {
    this.router.navigate(['company-registration-applications/retail-outlet/detail/', retailOutletId]).catch();
  }

  edit(id: any): void {
    this.dialog.open(RetailOutletDialogComponent, {
      data: {id, path: 'new'},
      maxWidth: '90vw'
    }).afterClosed()
      .subscribe(()=> this.getRetailOutlet());
  }

  private getRetailOutlet(params = this.filterParams): void {
    this.loading = true;
    this.service.getRetailOutlet(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.retailOutlet = res.data;
          this.paginate = res.meta.pagination;
          this.store.setPage(this.paginate);
        }
      })
  }
}
