import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SvgIconComponent} from 'angular-svg-icon';

@Component({
  standalone: true,
  selector: 'em-chips',
  templateUrl: './em-chips.component.html',
  styleUrls: ['./em-chips.component.scss'],
  imports: [CommonModule, FormsModule, SvgIconComponent]
})
export class EmChipsComponent {
  readonly items = input<string[]>([]);
  readonly itemsChange = output<string[]>();

  newItem = '';

  addFromInput(): void {
    const raw = this.newItem || '';
    const parts = raw.split(/[;,\n]+/).map(p => p.trim()).filter(p => p);
    if (!parts.length) return;

    const currentItems = this.items();
    const toAdd: string[] = [];
    for (const p of parts) {
      if (!currentItems.includes(p)) toAdd.push(p);
    }

    if (toAdd.length) {
      const newItems = [...currentItems, ...toAdd];
      this.itemsChange.emit(newItems);
    }
    this.newItem = '';
  }

  remove(index: number): void {
    const currentItems = this.items();
    if (index < 0 || index >= currentItems.length) return;
    const arr = currentItems.slice();
    arr.splice(index, 1);
    this.itemsChange.emit(arr);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addFromInput();
    }
  }
}
