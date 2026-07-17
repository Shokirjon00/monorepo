import { animate, state, style, transition, trigger } from '@angular/animations';

export const EXPAND_DETAIL = trigger('detailExpand', [
  state('collapsed', style({ height: '0px', minHeight: '0', padding: 0, overflow: 'hidden' })),
  state('expanded', style({ height: '*' })),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
]);
