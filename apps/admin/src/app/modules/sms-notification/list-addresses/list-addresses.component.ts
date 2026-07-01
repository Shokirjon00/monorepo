import { Component, OnInit, signal, AfterViewInit, viewChild, inject } from '@angular/core';
import { TableComponent } from "@shared/components/table/table.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { IFilterParams } from "@core/interfaces/filter-params.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ICaption, IOptionAction } from "@core/interfaces/table.interface";
import { finalize, takeUntil } from "rxjs";
import { IPaginate } from '@eskhata/util';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services/message.service";
import { ITab } from "@core/interfaces/header.interface";
import { parseFilterParams } from "@core/utils/filter-util";
import { ListAddressesService } from "@modules/sms-notification/list-addresses/service/list-addresses.service";
import { IListAddresses } from "@modules/sms-notification/list-addresses/interface/list-addresses";
import { ListAddressesConstants } from "@modules/sms-notification/list-addresses/list-addresses.constants";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { isEmptyObject, setDefaultFilterValue } from "@core/utils";

@Component({
  standalone: true,
  selector: 'em-list-addresses',
  templateUrl: './list-addresses.component.html',
  styleUrls: ['./list-addresses.component.scss'],
  providers: [ListAddressesService],
  imports: [
    TableComponent,
    EbLoaderComponent,
    ToastComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    ]
})
export class ListAddressesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  actionLoading = signal(false);
  list: IListAddresses[];
  columns = ListAddressesConstants.LIST_ADDRESSES_COLUMNS;
  tabMenuItems: ITab[] = ListAddressesConstants.HEADER_TABS;
  optionActions: IOptionAction[] = ListAddressesConstants.TABLE_SETTING_OPTIONS;
  captionKey = 'listAddressFiltersForm-cols'
  paginate: IPaginate | any;
  params: Params = {};

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ListAddressesService);
  private readonly messageService = inject(MessageService);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.getListAddresses();
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
    this.table().render(this.columns, this.list);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getListAddresses()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.list.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  public checkList(statusId: any): void {
    const id = statusId.item.id;
    this.actionLoading.set(true);
    this.service.checklistStatus(id)
      .pipe(
        finalize(() => this.actionLoading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe((res: any) => {
        if (res.status) {
          this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message});
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
        this.getListAddresses();
      });
  }

  private getListAddresses(params = this.filterParams): void {
    this.loading.set(true)
    this.service.getList(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.list = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getListAddresses(params);
        }
      });
  }
}
