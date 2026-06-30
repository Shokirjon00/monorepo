export class Week {
  name: string;
  value: string;
  from: string;
  to: string;
  timeComplete: boolean;
  completed: boolean;
  sameTime?: boolean;
  days: IDay[];
}

export interface IDay{
  name?: string;
  value?: string;
  from?: string;
  to?: string;
  allDay?: boolean;
  completed?: boolean;
}
