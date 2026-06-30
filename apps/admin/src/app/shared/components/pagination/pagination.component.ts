import { Component, ElementRef, Input, OnChanges, SimpleChanges, viewChild, ViewChild } from '@angular/core';
import {IPaginate} from '@core/interfaces/paginate.interface';
import {HeaderService} from '@core/services/header.service';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FormsModule} from '@angular/forms';
import {ClickOutsideModule} from '@core/directives/click-outside/click-outside.module';
import {CommonModule} from '@angular/common';
import {DestroyableComponent} from '@core/abstract/destroyable.component';

/**
 * @Deprecated use em-pagination
 */
@Component({
  standalone: true,
  selector: 'em-pagination',
  templateUrl: './pagination.component.html',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ClickOutsideModule,
    CommonModule
  ],
  styleUrls: ['./pagination.component.scss']
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

  constructor(
    private headerService: HeaderService
  ) {
    super();
  }

  toggle(): void {
    this.showPagSize = !this.showPagSize
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

  private setPage(page: number): void {
    if (this.page.pageNumber !== page) {
      this.page.pageNumber = page;
      this.headerService.setPageChange(this.page)
    }
  }
}
