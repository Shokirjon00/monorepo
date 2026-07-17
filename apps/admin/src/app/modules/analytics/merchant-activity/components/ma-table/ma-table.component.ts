import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmNumberPipe } from '@modules/analytics/pipes/em-number.pipe';
import { IMaColumn } from "@modules/analytics/merchant-activity/interfaces/merchant-activity.interface";

export type MaRow = Record<string, string | number | null | undefined>;

@Component({
  standalone: true,
  selector: 'em-ma-table',
  templateUrl: './ma-table.component.html',
  styleUrls: ['./ma-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EmNumberPipe],
})
export class MaTableComponent {
  readonly columns = input<IMaColumn[]>([]);
  readonly rows = input<MaRow[]>([]);

  readonly gridTemplate = (): string =>
    this.columns().map((c, i) => (i === 0 ? 'max-content' : `minmax(0, ${c.flex ?? 1}fr)`)).join(' ');

  trackCol = (_: number, col: IMaColumn): string => col.key;
}
