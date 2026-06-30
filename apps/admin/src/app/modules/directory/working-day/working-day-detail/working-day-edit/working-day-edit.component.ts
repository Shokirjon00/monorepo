import { Component, DestroyRef, EventEmitter, inject, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IWorkingDayDetail } from '@modules/directory/working-day/interfaces/working-day-detail.interface';
import { WorkingDayService } from '@modules/directory/working-day/services/working-day.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common'
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IResponse } from "@modules/directory/working-day/interfaces/working-day.model";

class WorkingDaysModel {
  monday: WeekDay = new WeekDay();
  tuesday: WeekDay = new WeekDay();
  wednesday: WeekDay = new WeekDay();
  thursday: WeekDay = new WeekDay();
  friday: WeekDay = new WeekDay();
  saturday: WeekDay = new WeekDay();
  sunday: WeekDay = new WeekDay();
  launchBreake: WeekDay = new WeekDay();
}

class WeekDay {
  enabled: boolean = false;
  start: string = '00:00';
  end: string = '23:59';
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
    ValidatorComponent,
    FormsModule,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class WorkingDayEditComponent extends EMBaseForm implements OnInit {
  @Output() saved = new EventEmitter<{ id: string }>();

  form: FormGroup;
  workingDayDetail: IWorkingDayDetail;
  workingDaysModel: WorkingDaysModel = new WorkingDaysModel();
  submitted: boolean = false;
  modalMode: boolean = false;
  isNew: boolean = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly workingDayService = inject(WorkingDayService);

  workingDayId = this.activatedRoute.snapshot.params['id'];
  private readonly updateUrl = this.activatedRoute.snapshot.routeConfig?.path ?? 'new';

  constructor(
    location: Location,
    dialog: MatDialog,
    @Optional() private dialogRef: MatDialogRef<WorkingDayEditComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: {
      modalMode: boolean;
      workingDayId: string | null
    }
  ) {
    super(location, dialog);
    this.modalMode = !!dialogData?.modalMode;

    if (this.modalMode) {
      this.workingDayId = dialogData?.workingDayId;
      this.isNew = !this.workingDayId;
    } else {
      this.workingDayId = this.activatedRoute.snapshot.params['id'];
      this.updateUrl = this.activatedRoute.snapshot.routeConfig?.path || '';
      this.isNew = this.updateUrl === 'new';
    }
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();

    if (this.isNew) {
      return;
    }

    if (this.workingDayId) {
      this.getDetail();
    } else if (!this.modalMode) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Не указан ID рабочих дней'
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    this.prepareFormValues();

    const request$ = this.getRequestObservable();

    request$
      .pipe(
        mergeMap(res => this.handleResponse(res)),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => this.processResult(res));
  }

  override back(): void {
    if (this.modalMode) {
      this.dialogRef.close();
    } else {
      this.location.back();
    }
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.workingDayId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      monday: ['', Validators.required],
      tuesday: ['', Validators.required],
      wednesday: ['', Validators.required],
      thursday: ['', Validators.required],
      friday: ['', Validators.required],
      saturday: ['', Validators.required],
      sunday: ['', Validators.required],
      launchBreake: ['', Validators.required],
      isActive: [true]
    });
  }

  private getDetail(): void {
    this.workingDayService.getWorkingDayDetail(this.workingDayId)
      .pipe(
        finalize(() => {
          this.WorkingDaysInit()
        }),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        this.workingDayDetail = res.data;
        this.dataSource = res.data;
        this.form.patchValue(res.data);
      });
  }

  private prepareFormValues(): void {
    const formatTime = (enabled: boolean, start: string, end: string): string =>
      enabled ? `${start}-${end}` : '00:00-00:00';

    const days: (keyof typeof this.workingDaysModel)[] = [
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];

    days.forEach(day => {
      const { enabled, start, end } = this.workingDaysModel[day];
      this.form.controls[day].setValue(formatTime(enabled, start, end));
    });

    const { start, end } = this.workingDaysModel.launchBreake;
    this.form.controls['launchBreake'].setValue(`${start}-${end}`);
  }

  private getRequestObservable(): Observable<any> {
    if (this.modalMode || !this.workingDayId) {
      return this.workingDayService.createWorkingDay(this.form.value);
    }
    return this.workingDayService.updateWorkingDay({
      ...this.workingDayDetail,
      ...this.form.value
    });
  }

  private handleResponse(res: IResponse): Observable<IResponse> {
    this.messageService.add({
      severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
      summary: res.message
    });
    return of(res).pipe(delay(res.status ? 2000 : 0));
  }

  private processResult(res: IResponse): void {
    if (res.status) {
      const resultId = res.data?.id || this.workingDayId;
      if (this.modalMode) {
        this.dialogRef.close({ id: resultId });
      } else {
        this.form.reset();
        this.back();
      }
    } else {
      setValidationErrors(this.form, res);
      if (res.errors) {
        Object.entries(res.errors).forEach(([field, messages]) => {
          const errorMessages = Array.isArray(messages) ? messages : [messages];
          errorMessages.forEach(msg => {
            this.messageService.add({
              severity: ToastEnum.ERROR,
              summary: msg
            });
          });
        });
      }
    }
  }

  private WorkingDaysInit(): void {
    let times: string[];

    this.workingDaysModel.monday.enabled = this.workingDayDetail.monday != '00:00-00:00';
    times = this.workingDayDetail.monday.split('-');
    this.workingDaysModel.monday.start = times[0]
    this.workingDaysModel.monday.end = times[1]

    this.workingDaysModel.tuesday.enabled = this.workingDayDetail.tuesday != '00:00-00:00';
    times = this.workingDayDetail.tuesday.split('-');
    this.workingDaysModel.tuesday.start = times[0]
    this.workingDaysModel.tuesday.end = times[1]

    this.workingDaysModel.wednesday.enabled = this.workingDayDetail.wednesday != '00:00-00:00';
    times = this.workingDayDetail.wednesday.split('-');
    this.workingDaysModel.wednesday.start = times[0]
    this.workingDaysModel.wednesday.end = times[1]

    this.workingDaysModel.thursday.enabled = this.workingDayDetail.thursday != '00:00-00:00';
    times = this.workingDayDetail.thursday.split('-');
    this.workingDaysModel.thursday.start = times[0]
    this.workingDaysModel.thursday.end = times[1]

    this.workingDaysModel.friday.enabled = this.workingDayDetail.friday != '00:00-00:00';
    times = this.workingDayDetail.friday.split('-');
    this.workingDaysModel.friday.start = times[0]
    this.workingDaysModel.friday.end = times[1]

    this.workingDaysModel.saturday.enabled = this.workingDayDetail.saturday != '00:00-00:00';
    times = this.workingDayDetail.saturday.split('-');
    this.workingDaysModel.saturday.start = times[0]
    this.workingDaysModel.saturday.end = times[1]

    this.workingDaysModel.sunday.enabled = this.workingDayDetail.sunday != '00:00-00:00';
    times = this.workingDayDetail.sunday.split('-');
    this.workingDaysModel.sunday.start = times[0]
    this.workingDaysModel.sunday.end = times[1]

    this.workingDaysModel.launchBreake.enabled = this.workingDayDetail.sunday != '00:00-00:00';
    times = this.workingDayDetail.launchBreake.split('-');
    this.workingDaysModel.launchBreake.start = times[0]
    this.workingDaysModel.launchBreake.end = times[1]
  }
}
