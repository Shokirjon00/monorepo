import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICompanyLegalForm } from '@modules/directory/company-legal-form/interfaces/company-legal-form.interface';
import { CompanyLegalFormService } from '@modules/directory/company-legal-form/services/company-legal-form.service';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { CompanyLegalFormConstants } from "@modules/directory/company-legal-form/company-legal-form.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-company-legal-form',
  templateUrl: './company-legal-form.component.html',
  styleUrls: ['./company-legal-form.component.scss'],
  providers: [CompanyLegalFormService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class CompanyLegalFormComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  legalForms: ICompanyLegalForm[];
  loading: boolean;
  columns = CompanyLegalFormConstants.COMPANYLEGALFORM_COLUMNS;
  tableActions: IRowAction[] = CompanyLegalFormConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'legal-form';
  actions: IAction[] = CompanyLegalFormConstants.LEGAL_FORM_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CompanyLegalFormService);
  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getLegalForms(params);
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
    } as ICaption))
    this.table().render(this.columns, this.legalForms)
  }

  detail(legalFormId: string): void {
    this.router.navigate(['directory/legal-form/info', legalFormId])
      .catch()
  }

  edit(legalFormId: string): void {
    this.router.navigate(['directory/legal-form/edit', legalFormId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getLegalForms()
  }

  private getLegalForms(params = this.filterParams): void {
    this.loading = true
    this.service.getLegalForms(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.legalForms = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
