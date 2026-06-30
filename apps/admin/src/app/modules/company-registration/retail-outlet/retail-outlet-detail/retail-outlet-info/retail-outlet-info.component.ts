import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { NgxPermissionsModule } from "ngx-permissions";
import { ActivatedRoute } from "@angular/router";
import { finalize } from "rxjs";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ITab } from "@core/interfaces/header.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import {
  RetailOutletDetailConstants
} from "@modules/company-registration/retail-outlet/retail-outlet-detail/retail-outlet-info.constants";
import {RetailOutletService} from "@modules/company-registration/retail-outlet/services/retail-outlet.service";
import {
  IIRetailOutletDetail
} from "@modules/company-registration/retail-outlet/interfaces/retail-outlet-detail.interfaces";
import {ActionsComponent} from "@shared/components/actions/actions.component";
import {
  RetailOutletDialogComponent
} from "@modules/company-registration/retail-outlet/retail-outlet-detail/retail-outlet-dialog/retail-outlet-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {HeaderService} from "@core/services";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActionEnum} from "@core/enums/action-enum";
import {
  RetailOutletStateService
} from "@modules/company-registration/retail-outlet/services/retail-outlet-state.service";
import {DateTimePipe} from "@core/pipe/date-time.pipe";

@Component({
  standalone: true,
  selector: 'em-retail-outlet-info',
  templateUrl: './retail-outlet-info.component.html',
  imports: [
    NgxPermissionsModule,
    ReactiveFormsModule,
    EmHeaderComponent,
    ActionsComponent,
    DateTimePipe,
  ],
  styleUrls: ['./retail-outlet-info.component.scss'],
  providers: [RetailOutletService]
})

export class RetailOutletInfoComponent implements OnInit {
  loading = signal(false);
  applicationInfo: IIRetailOutletDetail;
  form: FormGroup;
  tabMenuItems: ITab[];
  fileStorageUrl: string;
  fileStorageToken: string;
  actions = RetailOutletDetailConstants.ACTIONS;
  retailOutletId: string;

  private readonly service = inject(RetailOutletService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(HeaderService);
  private stateService = inject(RetailOutletStateService);

  ngOnInit(): void {
    this.retailOutletId = this.activatedRoute.snapshot.parent.params['id'];
    this.tabMenuItems = RetailOutletDetailConstants.getHeaderTabs(this.retailOutletId);
    this.getCompanyRegistrationDetail();
    this.initDialogListener();
  }

  private initDialogListener(): void {
    this.store.getDialog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res === 'status-application') {
          this.editStatus();
        }
      });
  }

  private editStatus(): void {
    const dialogExist = this.dialog.getDialogById('status-application');
    if (dialogExist) return;
    this.dialog.open(RetailOutletDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      id: 'status-application',
      data: {id: this.applicationInfo.id}
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getCompanyRegistrationDetail();
        this.store.setDialog(null);
      })
  }

  private getCompanyRegistrationDetail(): void {
    this.loading.set(true);
    this.service.getRetailOutletDetail(this.retailOutletId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.applicationInfo = res.data;
        this.stateService.setRetailOutletInfo(this.applicationInfo);
        this.actions = RetailOutletDetailConstants.ACTIONS.map(a => ({
          ...a,
          path: a.code === ActionEnum.ADD
            ? `/clients/company/${this.applicationInfo.companyId}/merchant/new`
            : a.path
        }));
      });
  }
}
