import { Component, input, signal, computed, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITab } from '@core/interfaces/header.interface';
import { NgxPermissionsModule } from 'ngx-permissions';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { isPhone } from "@core/helper";

@Component({
  standalone: true,
  selector: 'em-tab-menu',
  templateUrl: './tab-menu.component.html',
  styleUrl: './tab-menu.component.scss',
  imports: [CommonModule, NgxPermissionsModule, RouterModule, SvgIconComponent, ClickOutsideModule]
})
export class TabMenuComponent implements OnInit {
  readonly tabItems = input<ITab[]>([]);
  readonly enableDropdown = input<boolean>(false);
  readonly dropdownLabel = input<string>('');
  selectedLabel = signal<string | null>(null);
  showDropdown = signal<boolean>(false);
  isMobile = signal<boolean>(isPhone());

  private router = inject(Router);
  private syncSelectedLabelEffect = effect(() => {
    const items = this.tabItems();
    if (items && items.length) {
      this.setSelectedLabelFromPath();
    }
  });

  ngOnInit(): void {
    this.updateDropdownState();
    this.setSelectedLabelFromPath();
  }

  readonly visibleTabItems = computed(() => {
    const items = this.tabItems();
    const enableDropdown = this.enableDropdown();
    return enableDropdown && items?.length > 5 ? items.slice(0, 5) : items;
  });

  readonly dropdownTabItems = computed(() => {
    const items = this.tabItems();
    const enableDropdown = this.enableDropdown();
    return enableDropdown && items?.length > 5 ? items.slice(5) : [];
  });

  toggleDropdown(): void {
    this.showDropdown.set(!this.showDropdown());
  }

  private updateDropdownState(): void {
    this.isMobile.set(isPhone());
  }

  selectItem(label: string): void {
    this.selectedLabel.set(label);
  }

  private setSelectedLabelFromPath(): void {
    const path = this.router.url.split('?')[0];
    const items = this.tabItems();

    const match = items?.length > 5
      ? items.slice(5).find(item => path.endsWith(item.path))
      : null;

    if (match) {
      this.selectedLabel.set(match.label);
    }
  }

}
