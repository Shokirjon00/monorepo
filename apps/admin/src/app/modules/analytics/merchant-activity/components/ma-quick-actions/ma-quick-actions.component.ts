import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IQuickAction } from '../../interfaces/merchant-activity.interface';

@Component({
  standalone: true,
  selector: 'em-ma-quick-actions',
  templateUrl: './ma-quick-actions.component.html',
  styleUrls: ['./ma-quick-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MaQuickActionsComponent {
  readonly actions = input<IQuickAction[]>([]);
  readonly actionClick = output<IQuickAction>();
}
