import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Params } from '@angular/router';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'em-data-time',
  templateUrl: './data-time.component.html',
  imports: [
    ToastComponent,
    FormsModule
  ],
  styleUrls: ['./data-time.component.scss']
})

export class DataTimeComponent {

  weeks: Params = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  }

  private readonly messageService = inject(MessageService);
  readonly dialogRef = inject(MatDialogRef<DataTimeComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  get dataWeekKeysArray(): string[] {
    return Object.keys(this.weeks);
  }

  selectedTime(day: string, evt: Event): void {
    const checked = (<HTMLInputElement>evt.currentTarget).checked;
    if (checked) {
      this.data[day].from = '00:00:00';
      this.data[day].to = '23:59:59';
    }
  }

  saveDate(): void {
    let error: boolean;
    this.dataWeekKeysArray.forEach(day => {
      if (this.data[day].isActive && this.data[day].from >= this.data[day].to) {
        this.messageService.add({
          severity: ToastEnum.WARN, summary: 'Время начали не может быть больше окончания',
          detail: `${this.weeks[day]} \n время ${this.data[day].from} не должен быть больше ${this.data[day].to}`
        });
        error = true;
      }
    })

    if (error) return;
    this.dialogRef.close(this.data)
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
