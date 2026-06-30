import { Component, ElementRef, inject, Input, OnChanges, SimpleChanges, viewChild } from '@angular/core';
import { IPaginate } from "@core/interfaces/paginate.interface";
import { HeaderService } from "@core/services/header.service";
import { DestroyableComponent } from "@core/directives/destroyable.component";

import { AngularSvgIconModule } from "angular-svg-icon";
import { FormsModule } from "@angular/forms";
import { ClickOutsideModule } from "@core/directives/click-outside/click-outside.module";
import { Platform } from "@angular/cdk/platform";
import { NgClass } from "@angular/common";

@Component({
  standalone: true,
  selector: 'em-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ClickOutsideModule,
    NgClass
  ],
})
export class PaginationComponent extends DestroyableComponent implements OnChanges {
  readonly inputElement = viewChild<ElementRef>('inputElement');

  @Input() page: IPaginate = {
    pageNumber: 1,
    pageSize: 15,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 1,
    totalPages: 1
  };
  currentPage: number;
  isOpen: boolean;
  showPagSize: boolean;
  pagSizes: number[] = [
    15, 30, 50
  ];

  private headerService = inject(HeaderService);
  private platform = inject(Platform);

  isMobile = this.platform.IOS || this.platform.ANDROID;

  toggle(): void {
    this.showPagSize = !this.showPagSize
  }

  getPageRange(): number[] {
    const rangeSize = 5;
    let startPage = Math.max(1, this.page.pageNumber - Math.floor(rangeSize / 2));
    let endPage = startPage + rangeSize - 1;
    if (endPage > this.page.totalPages) {
      endPage = this.page.totalPages;
      startPage = Math.max(1, endPage - rangeSize + 1);
    }
    return Array.from({length: (endPage - startPage + 1)}, (_, i) => startPage + i);
  }

  showEllipsis(): boolean {
    return this.page.totalPages > 6 && this.page.pageNumber < this.page.totalPages - 3;
  }

  getLastPages(): number[] {
    const lastPages = [];
    if (this.page.totalPages > 6 && this.page.pageNumber < this.page.totalPages - 3) {
      lastPages.push(this.page.totalPages);
    }
    return lastPages;
  }

  setPageSize(pageSize: number): void {
    this.page.pageSize = pageSize;
    this.headerService.setPageChange(this.page)
  }

  setPageNumber(event: Event): void {
    event.stopPropagation()
    this.isOpen = !this.isOpen;
    this.currentPage = this.page.pageNumber;
    this.setTimeout(this.inputElement()?.nativeElement.focus(), 0)
  }

  previousPage(): void {
    this.isOpen = false;
    if (this.page.pageNumber > 1) {
      this.setPage(this.page.pageNumber - 1);
    }
  }

  nextPage(): void {
    this.isOpen = false;
    if (this.page.pageNumber < this.page.totalPages) {
      this.setPage(this.page.pageNumber + 1);
    }
  }

  enterPage(event: KeyboardEvent | any): void {
    this.isOpen = false;
    const value = event.currentTarget.value;
    if (this.page.totalPages >= value) {
      this.setPage(value);
    }
  }

  close(): void {
    this.isOpen = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['page'].currentValue.hasNextPage && (changes['page'].currentValue.totalPages > 1)) {
      this.page.pageNumber = this.page.totalPages;
      this.headerService.setPageChange(this.page)
    }
  }

  setPage(page: number | any): void {
    if (page >= 1 && page <= this.page.totalPages) {
      if (this.page.pageNumber !== page) {
        this.page.pageNumber = page;
        this.headerService.setPageChange(this.page);
      }
    }
  }

}
