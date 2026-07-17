import { Component, input, inject, output } from '@angular/core';
import { ITab } from '@core/interfaces/header.interface';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';
import { TabMenuComponent } from '@shared/components/tab-view/tab-menu.component';
import { MainFilterComponent } from '@shared/dialogs/main-filter/main-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { IAction } from '@shared/components/actions/action.interface';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { QuickFilterComponent } from '@shared/components/quick-filter/quick-filter.component';
import { ICaption } from '@core/interfaces/table1.interface';
import { isPhone } from '@core/helper';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { NgClass } from '@angular/common';
import { bannerAmountSignal } from '@shared/components/banner/banner-signal';

@Component({
  standalone: true,
  selector: 'em-header2',
  templateUrl: './em-header.component.html',
  styleUrls: ['./em-header.component.scss'],
  imports: [RouterModule, BreadcrumbsComponent, TabMenuComponent, QuickFilterComponent, BannerComponent, NgClass],
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
  private router = inject(Router);

  constructor() {
    super();
    this.activeFilter();
  }

  isExactAdvancePaymentsPage(): boolean {
    const path = this.router.url.split('?')[0];
    const banner = bannerAmountSignal();
    return path === '/advance-payments' && banner.isBannerVisible === true;
  }

  openFilter(): void {
    this.matDialog
      .open(MainFilterComponent, {
        panelClass: 'mobile-dialog',
        data: {
          componentKey: this.filterStorageKey(),
          captions: this.filterFields(),
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
