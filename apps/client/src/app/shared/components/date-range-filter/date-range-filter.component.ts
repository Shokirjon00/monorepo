import { Component, ElementRef, inject, Input, OnDestroy, OnInit, output } from '@angular/core';
import { DateRange } from '@eskhata/util';

@Component({
  selector: 'em-date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrls: ['./date-range-filter.component.scss'],
  imports: [],
})
export class DateRangeFilterComponent implements OnInit, OnDestroy {
  @Input() availableRanges: DateRange[] = [DateRange.TODAY, DateRange.WEEKLY, DateRange.MONTHLY];
  @Input() selectedRange: DateRange = DateRange.TODAY;
  readonly rangeChange = output<DateRange>();

  dropdownOpen = false;
  private elRef = inject(ElementRef);

  ngOnInit(): void {
    document.addEventListener('click', this.onClickOutside, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onClickOutside, true);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectRange(range: DateRange): void {
    if (this.selectedRange !== range) {
      this.selectedRange = range;
      this.rangeChange.emit(range);
    }
    this.dropdownOpen = false;
  }

  displayLabel(range: DateRange): string {
    switch (range) {
      case DateRange.TODAY:
        return 'Сегодня';
      case DateRange.WEEKLY:
        return 'Неделя';
      case DateRange.MONTHLY:
        return 'Месяц';
      default:
        return '';
    }
  }

  private onClickOutside = (event: Event): void => {
    if (this.dropdownOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  };
}
