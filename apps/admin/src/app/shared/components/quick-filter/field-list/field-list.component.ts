import { Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ICaption } from '@core/interfaces';

@Component({
  selector: 'em-field-list',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent],
  templateUrl: './field-list.component.html',
  styleUrl: './field-list.component.scss'
})
export class FieldListComponent implements OnInit {
  readonly maxHeight = input<string>('340px');
  readonly isOpen = input<boolean>();
  readonly index = input<number>();
  readonly canSearch = input<boolean>(true);
  @Output() selected = new EventEmitter<any>();
  searchField$ = new FormControl('');

  private cloneItems: ICaption[] = [];
  private _items: ICaption[] = [];

  get items(): ICaption[] {
    return this._items;
  }

  @Input() set items(items: ICaption[]) {
    if (items) {
      this.cloneItems = items;
      this._items = items;
    }
  }

  select(item: any): void {
    this.selected.emit(item);
  }

  ngOnInit(): void {
    this.searchField$.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(500),
      )
      .subscribe(text => {
        if (text) {
          this._items = this.cloneItems?.filter(x => x.key.toLowerCase().includes(text.toLowerCase()));
        } else {
          this._items = this.cloneItems?.slice();
        }
      })
  }
}
