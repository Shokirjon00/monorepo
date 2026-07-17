import { Component, inject, input } from '@angular/core';
import { ITab } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ICaption } from '@core/interfaces/table.interface';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';
import { TabMenuComponent } from "@shared/components/tab-view/tab-menu.component";
import { QuickFilterComponent } from "@shared/components/quick-filter/quick-filter.component";
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { MainFilterComponent } from "@shared/dialogs/main-filter/main-filter.component";
import { MatDialog } from "@angular/material/dialog";
import { takeUntil } from "rxjs";

@Component({
  standalone: true,
  selector: 'em-header2',
  templateUrl: './em-header.component.html',
  styleUrls: ['./em-header.component.scss'],
  imports: [
    RouterModule,
    BreadcrumbsComponent,
    TabMenuComponent,
    QuickFilterComponent,
    ]
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
  isShowFilter: boolean = false;
  private readonly matDialog = inject(MatDialog)
  private readonly route = inject(ActivatedRoute)

  constructor() {
    super();
    this.activeFilter();
  }

  openFilter(): void {
    this.matDialog.open(MainFilterComponent, {
      panelClass: 'mobile-dialog',
      data: {
        componentKey: this.filterStorageKey(),
        defaultFilterField: this.defaultFilterField(),
        filterFields: this.filterFields(),
        field: this.field(),
        filterParams: this.filterParams()
      }
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.activeFilter());
  }

  activeFilter(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params: any) => this.isShowFilter = Object.keys(params).length > 0);
  }
}
