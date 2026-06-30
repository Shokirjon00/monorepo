import {AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {TableComponent} from "@shared/components/table/table.component";
import {ICaption} from "@core/interfaces/table.interface";
import {IPaginate} from "@core/interfaces/paginate.interface";
import {ActivatedRoute} from "@angular/router";
import {
  CompanyRegistrationApplicationsService
} from "@modules/company-registration/list-registration/services/company-registration.service";
import {finalize, takeUntil} from "rxjs";
import {DestroyableComponent} from "@core/abstract/destroyable.component";
import {
  lIST_REGISTRATION_HISTORIES_COLUMNS,
} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-histories/list-registration-histories.columns";
import {ToastComponent} from "@shared/components/toast/toast.component";
import {
  ICompanyRegistrationHistory
} from "@modules/company-registration/list-registration/interfaces/company-registration-history.interfaces";
import {ITab} from "@core/interfaces/header.interface";
import {
  ListRegistrationDetailConstants
} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-info.constants";
import {EmHeaderComponent} from "@shared/components/em-header/em-header.component";
import {RetailOutletService} from "@modules/company-registration/retail-outlet/services/retail-outlet.service";
import {
  IRetailOutletHistory
} from "@modules/company-registration/retail-outlet/interfaces/retail-outlet-history.interfaces";
import {
  RETAIL_OUTLET_HISTORIES_COLUMNS
} from "@modules/company-registration/retail-outlet/retail-outlet-detail/retail-outlet-histories/retail-outlet-histories.columns";
import {
  RetailOutletDetailConstants
} from "@modules/company-registration/retail-outlet/retail-outlet-detail/retail-outlet-info.constants";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-retail-outlet-histories',
  templateUrl: './retail-outlet-histories.component.html',
  styleUrls: ['./retail-outlet-histories.component.scss'],
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent
  ],
  providers: [RetailOutletService]
})
export class RetailOutletHistoriesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  retailOutletHistory: IRetailOutletHistory[];
  tabMenuItems: ITab[];
  columns = RETAIL_OUTLET_HISTORIES_COLUMNS;
  paginate: IPaginate;
  readonly captionKey = 'retail-outlet-histories';
  private route = inject(ActivatedRoute);
  private retailOutletId = this.route.snapshot.parent.params['id'];
  private service = inject(RetailOutletService);
  protected readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.getRetailOutletHistories();
    this.tabMenuItems = RetailOutletDetailConstants.getHeaderTabs(this.retailOutletId);
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.retailOutletHistory);
  }

  private getRetailOutletHistories(): void {
    this.loading.set(true);
    this.service.getRetailOutletHistories(this.retailOutletId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => this.retailOutletHistory = res.data);
  }
}
