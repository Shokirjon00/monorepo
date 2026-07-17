export interface CashbackParamJson {
  monday: IWeekDay;
  tuesday: IWeekDay;
  wednesday: IWeekDay;
  thursday: IWeekDay;
  friday: IWeekDay;
  saturday: IWeekDay;
  sunday: IWeekDay
}

export interface IWeekDay{
  from: string;
  to: string;
}
