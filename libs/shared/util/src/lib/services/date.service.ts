import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class DateService {
  getDefaultStartDate(): string {
    const startDate = this.setTimeToStartOfDay(new Date());
    return startDate.toISOString();
  }

  getDefaultEndDate(): string {
    const endDate = this.setTimeToEndOfDay(new Date());
    return endDate.toISOString();
  }

  setTimeToStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  setTimeToEndOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 0, 0);
    return newDate;
  }
}
