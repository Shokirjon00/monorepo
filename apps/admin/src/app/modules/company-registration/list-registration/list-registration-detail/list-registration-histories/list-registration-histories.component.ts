import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { EmHeaderComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { ActivatedRoute } from "@angular/router";
import { CompanyRegistrationApplicationsService } from "@modules/company-registration/list-registration/services/company-registration.service";
import { finalize, takeUntil } from "rxjs";
import { DestroyableComponent } from '@eskhata/util';
import { lIST_REGISTRATION_HISTORIES_COLUMNS, } from "@modules/company-registration/list-registration/list-registration-detail/list-registration-histories/list-registration-histories.columns";
import { ICompanyRegistrationHistory } from "@modules/company-registration/list-registration/interfaces/company-registration-history.interfaces";
import { ITab } from '@eskhata/util';
import { ListRegistrationDetailConstants } from "@modules/company-registration/list-registration/list-registration-detail/list-registration-info.constants";

@Component({
  standalone: true,
  selector: 'em-list-registration-histories',
  templateUrl: './list-registration-histories.component.html',
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent
  ],
  styleUrls: ['./list-registration-histories.component.scss']
})
export class ListRegistrationHistoriesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  listRegistrationHistory: ICompanyRegistrationHistory[];
  tabMenuItems: ITab[];
  columns = lIST_REGISTRATION_HISTORIES_COLUMNS;
  paginate: IPaginate;
  readonly captionKey = 'list-registration-histories';

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CompanyRegistrationApplicationsService);
  private listRegistrationId = this.route.snapshot.parent.params['id'];

  constructor() {
    super();
    this.tabMenuItems = ListRegistrationDetailConstants.getHeaderTabs(this.listRegistrationId)
  }

  ngOnInit(): void {
    this.getCompanyRegistrationApplicationHistories()
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.listRegistrationHistory);
  }

  private getCompanyRegistrationApplicationHistories(): void {
    this.loading.set(true);
    this.service.getCompanyRegistrationApplicationHistories(this.listRegistrationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.listRegistrationHistory = res.data;
      });
  }
}
