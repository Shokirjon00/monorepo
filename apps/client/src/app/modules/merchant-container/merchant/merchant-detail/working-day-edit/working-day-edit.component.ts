import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, of } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { EmHeaderComponent, ToastModule, ValidatorModule } from '@eskhata/ui';
import { IWorkingDayDetail } from '@modules/merchant-container/merchant/merchant-detail/working-day-edit/interfaces/working-day-detail.interface';
import { WorkingDayService } from '@core/services/working-day.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyableComponent } from '@eskhata/util';

class WorkingDaysModel {
  monday: WeekDay = new WeekDay();
  tuesday: WeekDay = new WeekDay();
  wednesday: WeekDay = new WeekDay();
  thursday: WeekDay = new WeekDay();
  friday: WeekDay = new WeekDay();
  saturday: WeekDay = new WeekDay();
  sunday: WeekDay = new WeekDay();
  launchBreak: WeekDay = new WeekDay();
}

class WeekDay {
  enabled: boolean = false;
  start: string = '00:00';
  end: string = '00:00';
}

@Component({
  standalone: true,
  selector: 'em-working-day-edit',
  templateUrl: './working-day-edit.component.html',
  styleUrls: ['./working-day-edit.component.scss'],
  providers: [WorkingDayService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    FormsModule,
    EmHeaderComponent,
    ValidatorModule,
    ToastModule,
    CommonModule,
  ],
})
export class WorkingDayEditComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  workingDayDetail: IWorkingDayDetail;
  workingDaysModel: WorkingDaysModel = new WorkingDaysModel();
  submitted: boolean = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly workingDayService = inject(WorkingDayService);
  private readonly location = inject(Location);
  private workingDayId = this.activatedRoute.snapshot.params['id'];

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getDetail();
  }

  onSubmit(): void {
    this.updateFormValuesFromModel();
    this.saveWorkingDay();
  }

  back(): void {
    this.location.back();
  }

  private updateFormValuesFromModel(): void {
    const dayKeys: (keyof typeof this.workingDaysModel)[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'launchBreak',
    ];

    dayKeys.forEach(day => {
      const value = this.getDayValue(day);
      const formControl = day === 'launchBreak' ? 'lunchBreak' : day;
      this.form.controls[formControl].setValue(value);
    });
  }

  private getDayValue(day: keyof typeof this.workingDaysModel): string {
    const { start, end, enabled } = this.workingDaysModel[day];
    return day === 'launchBreak' ? `${start}-${end}` : enabled ? `${start}-${end}` : '00:00-00:00';
  }

  private saveWorkingDay(): void {
    this.workingDayService
      .updateWorkingDay({ ...this.workingDayDetail, ...this.form.value })
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message,
          });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => (this.submitted = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private mapWorkingDays(data: any): void {
    this.workingDaysModel = {
      monday: this.parseDay(data.monday),
      tuesday: this.parseDay(data.tuesday),
      wednesday: this.parseDay(data.wednesday),
      thursday: this.parseDay(data.thursday),
      friday: this.parseDay(data.friday),
      saturday: this.parseDay(data.saturday),
      sunday: this.parseDay(data.sunday),
      launchBreak: this.parseDay(data.lunchBreak),
    };
  }

  private parseDay(value: string): WeekDay {
    if (!value || value === '00:00-00:00') {
      return { start: '', end: '', enabled: false };
    }
    const [start, end] = value.split('-');
    return { start, end, enabled: true };
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.workingDayId],
      name: ['', [Validators.required, WhiteSpaceValidator.validate(), Validators.maxLength(100)]],
      monday: ['', Validators.required],
      tuesday: ['', Validators.required],
      wednesday: ['', Validators.required],
      thursday: ['', Validators.required],
      friday: ['', Validators.required],
      saturday: ['', Validators.required],
      sunday: ['', Validators.required],
      lunchBreak: ['', Validators.required],
      isActive: [false],
    });
  }

  private getDetail(): void {
    this.workingDayService
      .getWorkingDayDetail(this.workingDayId)
      .pipe(
        finalize(() => {
          this.workingDaysInit();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.workingDayDetail = res.data;
          this.form.patchValue(res.data);
          this.mapWorkingDays(res.data);
        }
      });
  }

  private workingDaysInit(): void {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'launchBreak'] as const;

    days.forEach(day => {
      const value = this.workingDayDetail[day];
      const [start, end] = value.split('-');

      this.workingDaysModel[day].enabled = value !== '00:00-00:00';
      this.workingDaysModel[day].start = start;
      this.workingDaysModel[day].end = end;
    });
  }
}
