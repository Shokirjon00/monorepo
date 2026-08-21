import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPermissionsModule } from 'ngx-permissions';
import { RouterModule, Router } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { ClickOutsideModule, ITab, isPhone } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-tab-menu',
  templateUrl: './tab-menu.component.html',
  styleUrls: ['./tab-menu.component.scss'],
  imports: [CommonModule, NgxPermissionsModule, RouterModule, SvgIconComponent, ClickOutsideModule],
})
export class TabMenuComponent implements OnInit {
  readonly tabItems = input<ITab[]>([]);
  readonly enableDropdown = input<boolean>(false);
  readonly dropdownLabel = input<string>('');

  readonly overflowAfter = input<number>(5);

  readonly dropdownFromViewport = input<boolean>(false);

  readonly filterDropdownByPermission = input<boolean>(true);

  selectedLabel = signal<string | null>(null);
  showDropdown = signal<boolean>(false);
  isMobile = signal<boolean>(isPhone());

  readonly dropdownEnabled = computed(() =>
    this.dropdownFromViewport() ? !this.isMobile() : this.enableDropdown()
  );

  readonly visibleTabItems = computed(() => {
    const items = this.tabItems();
    const limit = this.overflowAfter();
    return this.dropdownEnabled() && items?.length > limit ? items.slice(0, limit) : items;
  });

  readonly dropdownTabItems = computed(() => {
    const items = this.tabItems();
    const limit = this.overflowAfter();
    return this.dropdownEnabled() && items?.length > limit ? items.slice(limit) : [];
  });

  private router = inject(Router);

  private syncSelectedLabelEffect = effect(() => {
    const items = this.tabItems();
    if (items && items.length) {
      this.setSelectedLabelFromPath();
    }
  });

  ngOnInit(): void {
    this.isMobile.set(isPhone());
    this.setSelectedLabelFromPath();
  }

  toggleDropdown(): void {
    this.showDropdown.set(!this.showDropdown());
  }

  selectItem(label: string): void {
    this.selectedLabel.set(label);
  }

  private setSelectedLabelFromPath(): void {
    const path = this.router.url.split('?')[0];
    const items = this.tabItems();

    const match = items?.length > 5 ? items.slice(5).find(item => path.endsWith(item.path)) : null;

    if (match) {
      this.selectedLabel.set(match.label);
    }
  }
}
