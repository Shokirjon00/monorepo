import {
  Component,
  ElementRef,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
  viewChild,
  input,
  inject
} from '@angular/core';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { CommonModule } from '@angular/common';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { isPhone } from "@core/helper";

@Component({
  standalone: true,
  selector: 'em-pagination',
  templateUrl: './pagination.component.html',
  imports: [AngularSvgIconModule, FormsModule, ClickOutsideModule, CommonModule],
  styleUrls: ['./pagination.component.scss']
})
export class EMPaginationComponent extends DestroyableComponent implements OnChanges {
  readonly inputElement = viewChild<ElementRef>('inputElement');
  readonly page = input<IPaginate>({
    pageNumber: 1,
    pageSize: 15,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 1,
    totalPages: 1
});
  @Output() pageChange = new EventEmitter<IPaginate>();
  isMobile = isPhone();
  currentPage: number;
  isOpen: boolean;
  showPagSize: boolean;
  pagSizes: number[] = [
    15, 30, 50
  ];
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  getPageRange(): number[] {
    const rangeSize = 5;
    let startPage = Math.max(1, this.page().pageNumber - Math.floor(rangeSize / 2));
    let endPage = startPage + rangeSize - 1;
    if (endPage > this.page().totalPages) {
      endPage = this.page().totalPages;
      startPage = Math.max(1, endPage - rangeSize + 1);
    }
    return Array.from({length: (endPage - startPage + 1)}, (_, i) => startPage + i);
  }

  showEllipsis(): boolean {
    return this.page().totalPages > 6 && this.page().pageNumber < this.page().totalPages - 3;
  }

  getLastPages(): number[] {
    const lastPages = [];
    if (this.page().totalPages > 6 && this.page().pageNumber < this.page().totalPages - 3) {
      lastPages.push(this.page().totalPages);
    }
    return lastPages;
  }

  toggle(): void {
    this.showPagSize = !this.showPagSize
  }

  setPageSize(pageSize: number): void {
    this.page().pageSize = pageSize;
    this.emitPageChanged();
  }

  setPageNumber(event: Event): void {
    event.stopPropagation()
    this.isOpen = !this.isOpen;
    this.currentPage = this.page().pageNumber;
    this.setTimeout(this.inputElement()?.nativeElement.focus(), 0)
  }

  setPage(page: number | any): void {
    if (page >= 1 && page <= this.page().totalPages) {
      const pageValue = this.page();
      if (pageValue.pageNumber !== page) {
        pageValue.pageNumber = page;
        this.emitPageChanged();
      }
    }
  }

  previousPage(): void {
    this.isOpen = false;
    if (this.page().pageNumber > 1) {
      this.setPage(this.page().pageNumber - 1);
    }
  }

  nextPage(): void {
    this.isOpen = false;
    if (this.page().pageNumber < this.page().totalPages) {
      this.setPage(this.page().pageNumber + 1);
    }
  }

  enterPage(event: KeyboardEvent | any): void {
    this.isOpen = false;
    const value = event.currentTarget.value;
    if (this.page().totalPages >= value) {
      this.setPage(value);
    }
  }

  close(): void {
    this.isOpen = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['page'].currentValue.hasNextPage && (changes['page'].currentValue.totalPages > 1)) {
      this.page().pageNumber = this.page().totalPages;
      this.emitPageChanged();
    }
  }

  private emitPageChanged(): void {
    this.pageChange.emit(this.page());
    this.navigate();
  }

  private navigate(): void {
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: {...this.route.snapshot.queryParams, page: this.page().pageNumber, pageSize: this.page().pageSize}
      })
      .catch();
  }
}
