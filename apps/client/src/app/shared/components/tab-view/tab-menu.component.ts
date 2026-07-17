import { Component, Input, OnInit, inject } from '@angular/core';
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
  @Input() tabItems: ITab[] = [];
  @Input() enableDropdown = false;
  @Input() dropdownLabel = '';

  selectedLabel: string | null = null;
  showDropdown = false;
  isMobile = isPhone();

  private router = inject(Router)

  ngOnInit(): void {
    this.updateDropdownState();
    let path = this.router.url.split('?')[0];
    if (this.tabItems?.length > 5) {
      this.tabItems.slice(5).forEach((item) => {
        if (path.endsWith(item.path)) {
          this.selectedLabel = item.label;
        }
      });
    }
  }

  get visibleTabItems(): ITab[] {
    return this.enableDropdown && this.tabItems?.length >= 5 ? this.tabItems.slice(0, 6) : this.tabItems;
  }

  get dropdownTabItems(): ITab[] {
    return this.enableDropdown && this.tabItems?.length >= 5 ? this.tabItems.slice(6) : [];
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  private updateDropdownState(): void {
    this.isMobile = isPhone();
    this.enableDropdown = !this.isMobile;
  }

  selectItem(label: string): void {
    this.selectedLabel = label;
  }
}
