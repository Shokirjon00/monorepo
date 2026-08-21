import { Component, input, inject, output } from '@angular/core';
import { ITab } from '@eskhata/util';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { TabMenuComponent } from '../tab-view/tab-menu.component';
import { ADVANCE_PAYMENTS_HEADER, MAIN_FILTER_DIALOG } from './em-header.tokens';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { IAction } from '@eskhata/util';
import { DestroyableComponent, isPhone } from '@eskhata/util';
import { QuickFilterComponent } from '../quick-filter/quick-filter.component';
import { ICaption } from '@eskhata/util';


import { NgClass } from '@angular/common';


@Component({
  standalone: true,
  selector: 'em-header2',
  templateUrl: './em-header.component.html',
  styleUrls: ['./em-header.component.scss'],
  imports: [RouterModule, BreadcrumbsComponent, TabMenuComponent, QuickFilterComponent, NgClass],
})
export class EmHeaderComponent extends DestroyableComponent {
  readonly defaultFilterField = input<string>();
  readonly filterParams = input<string>();
  readonly field = input<string>();
  readonly pageTitle = input<string>('');
  readonly showBreadcrumb = input<boolean>(false);
  readonly tabMenuItems = input<ITab[]>();
  readonly actions = input<IAction[]>([]);
  readonly filterFields = input<ICaption[]>([]);
  readonly filterStorageKey = input<string>('');
  readonly enableDropdown = input<boolean>(false);
  readonly showMobileFilter = input<boolean>(false);
  readonly dropdownLabel = input<string>();
  readonly paymentStatusGroup = input<
    {
      name: string;
      value: string;
    }[]
  >([]);
  readonly queryParams = input<{
    statusId?: string;
  }>({});

  readonly statusSelected = output<string>()
  isShowFilter: boolean = false;
  isMobile = isPhone();

  private matDialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private readonly mainFilterDialog = inject(MAIN_FILTER_DIALOG, { optional: true });
  private readonly isAdvancePaymentsHeader = inject(ADVANCE_PAYMENTS_HEADER);

  constructor() {
    super();
    this.activeFilter();
  }

  isExactAdvancePaymentsPage(): boolean {
    return this.isAdvancePaymentsHeader();
  }

  async openFilter(): Promise<void> {
    if (!this.mainFilterDialog) {
      return;
    }
    const dialogComponent = await this.mainFilterDialog();
    this.matDialog
      .open(dialogComponent, {
        panelClass: 'mobile-dialog',
        data: {
          componentKey: this.filterStorageKey(),
          captions: this.filterFields(),
          defaultFilterField: this.defaultFilterField(),
          filterFields: this.filterFields(),
          field: this.field(),
          filterParams: this.filterParams(),
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.activeFilter());
  }

  activeFilter(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params: any) => (this.isShowFilter = Object.keys(params).length > 0));
  }

  selectStatus(status: string): void {
    this.statusSelected.emit(status);
  }
}
