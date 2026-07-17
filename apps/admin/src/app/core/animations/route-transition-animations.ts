import {animate, query, style, transition, trigger} from '@angular/animations';

export const fader =
  trigger('routeAnimations', [
    transition('* <=> *', [
      // Set a default  style for enter and leave
      query(':enter, :leave', [
        style({
          opacity: 0,
        }),
      ], {optional: true}),
      // Animate the new page in
      query(':enter', [
        animate('300ms ease', style({ opacity: 1})),
      ], {optional: true})
    ]),
  ]);
