import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { PERIOD_ID, TODAY_ID } from '@core/helper';
import { SharedModule } from '@shared/shared.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'em-analytics-filter',
  templateUrl: './analytics-filter.component.html',
  styleUrls: ['./analytics-filter.component.scss'],
  imports: [SharedModule, DropdownComponent, AngularSvgIconModule, MatDialogModule],
  providers: [DatePipe]
})
export class AnalyticsFilterComponent extends DestroyableComponent {
  queryParams: IFilterParams | any = {};
  dataFilterApi: any;
  merchantApi: any;
  posesTypeApi: any;
  posesApi: any;
  dateType: { name: string, icon: string, id?: string };
  selectedMerchant: { name: string, icon: string };
  selectedPos: { name: string, icon: string };
  selectedPosType: { name: string, icon: string };
  merchantFilter : IFilterParams | any = {};
  posFilter: IFilterParams | any = {};
  posTypeFilter: IFilterParams | any = {};
  dateFlag: boolean;
  posId: string;

  private modalRef = inject(MatDialogRef<AnalyticsFilterComponent>)
  private matDialog = inject(MatDialog);
  private datePipe = inject(DatePipe);
  private data = inject(MAT_DIALOG_DATA)

  constructor() {
    super();
    this.queryParams = this.data.queryParams;
    this.dataFilterApi = this.data.dataFilterApi;
    this.merchantApi = this.data.merchantApi;
    this.posesTypeApi = this.data.posesTypeApi;
    this.posesApi = this.data.posesApi;
    this.dateFlag = this.data.dateFlag;
    this.dateType = this.data.dateType;
    this.selectedMerchant = this.data.selectedMerchant;
    this.selectedPos = this.data.selectedPos;
    this.selectedPosType = this.data.selectedPosType;

    if (this.queryParams.merchantId) {
      this.merchantFilter.merchantId = this.queryParams.merchantId;
      this.posFilter.merchantId = this.queryParams.merchantId;
      this.posTypeFilter.merchantId = this.queryParams.merchantId;
    }

    // if (this.queryParams.posId) {
    //   this.posFilter.id = this.queryParams.posId;
    // }

    if (this.queryParams.dateFilterTypeId === PERIOD_ID) {
      this.dateFlag = true;
      this.dateType = {
        name: this.datePipe.transform(this.queryParams.startDate, 'dd.MM.yyyy') + ' - ' + this.datePipe.transform(this.queryParams.endDate, 'dd.MM.yyyy'),
        icon: 'week.svg',
        id: PERIOD_ID,
      };
    }
  }

  dateChange(dateId: string): void {
    if (dateId === PERIOD_ID) {
      this.matDialog.open(SelectPeriodDialogComponent, {
        data: {
          start: this.queryParams.startDate,
          end: this.queryParams.endDate,
          maxSelectDays: 31
        },
        panelClass: 'date-picker'
      })
        .afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          if (res) {
            this.dateFlag = true;
            this.queryParams.startDate = res.start.format('yyyy-MM-DD hh:mm:ss');
            this.queryParams.endDate = res.end.format('yyyy-MM-DD hh:mm:ss');
            this.queryParams.dateFilterTypeId = dateId;
            this.dateType = {
              name: res.start.format('DD.MM.yyyy') + ' - ' + res.end.format('DD.MM.yyyy'),
              icon: 'week.svg',
              id: PERIOD_ID,
            };
          } else {
            if (this.queryParams.startDate && this.queryParams.endDate) {
              this.dateType = {
                name: new Date(this.queryParams.startDate).toLocaleDateString() + ' - ' + new Date(this.queryParams.endDate).toLocaleDateString(),
                icon: 'week.svg',
                id: PERIOD_ID,
              };
            }
          }
        })
    } else {
      this.queryParams.dateFilterTypeId = dateId;
    }
  }

  clearPeriod(): void {
    if (this.queryParams.startDate && this.queryParams.endDate) {
      this.queryParams.dateFilterTypeId = TODAY_ID;
      delete this.queryParams.startDate;
      delete this.queryParams.endDate;
      this.dateType = {name: 'Сегодня', icon: 'day.svg',};
    }
  }

  merchantChange(merchantId: string): void {
    this.queryParams.merchantId = merchantId;
    this.merchantFilter.merchantId = this.queryParams.merchantId;
    this.posFilter.merchantId = merchantId;
    this.posTypeFilter.merchantId = this.queryParams.merchantId;
    this.clearPos()
  }

  clearMerchant(): void {
    delete this.queryParams.merchantId;
    delete this.queryParams.posId;
    delete this.queryParams.posTypeId;
    this.selectedMerchant = {name: 'Все торговые точки', icon: 'checkmark-double.svg'};
    this.selectedPos = {name: 'Все кассы', icon: 'checkmark-double.svg'};
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg',};
    this.merchantFilter = {};
    this.posTypeFilter = {};
  }

  posesChange(posId: string): void {
    this.queryParams.posId = posId;
    this.posTypeFilter = `id==${this.queryParams.posId}`;
  }

  clearPos(): void {
    delete this.queryParams.posId;
    delete this.queryParams.posTypeId;
    this.selectedPos = {name: 'Все кассы', icon: 'checkmark-double.svg'};
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg',};
  }

  posesTypeChange(posesTypeId: string): void {
    this.queryParams.posTypeId = posesTypeId;
  }

  clearPosType(): void {
    delete this.queryParams.posTypeId;
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg'};
  }

  applyFilter(): void {
    this.modalRef.close(this.queryParams);
  }

  resetFilter(): void {
    this.dateFlag = false;
    this.queryParams.dateFilterTypeId = TODAY_ID;
    delete this.queryParams.merchantId;
    delete this.queryParams.posId;
    delete this.queryParams.posTypeId;
    delete this.queryParams.startDate;
    delete this.queryParams.endDate;
    this.selectedMerchant = {name: 'Все торговые точки', icon: 'checkmark-double.svg'};
    this.selectedPos = {name: 'Все кассы', icon: 'checkmark-double.svg'};
    this.selectedPosType = {name: 'Тип кассы', icon: 'checkmark-double.svg'};
    this.dateType = {name: 'Сегодня', icon: 'day.svg'};
    this.modalRef.close(this.queryParams);
  }
}
