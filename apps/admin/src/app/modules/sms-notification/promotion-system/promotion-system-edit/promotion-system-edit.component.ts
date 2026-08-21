import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Component, ElementRef, inject, Input, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@eskhata/util';
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { SmsService } from "@modules/sms-notification/promotion-system/service/sms.service";
import { ISMS } from "@modules/sms-notification/promotion-system/interface/sms.interface";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipsModule } from "@angular/material/chips";
import { NgxMaskDirective } from "ngx-mask";

@Component({
  standalone: true,
  selector: 'em-promotion-system-edit',
  templateUrl: './promotion-system-edit.component.html',
  styleUrls: ['./promotion-system-edit.component.scss'],
  providers: [SmsService],
  imports: [
    SvgIconComponent,
    ValidatorComponent,
    ToastComponent,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    NgxMaskDirective,
    EmHeaderComponent
  ]
})
export class PromotionSystemEditComponent extends EMBaseForm implements OnInit {
  readonly chipInput = viewChild<ElementRef>('chipInput');

  form: FormGroup;
  smsNotificationsDetail: ISMS;
  submitted: boolean = false;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  visible = true;
  removable = true;
  addOnBlur = true;
  readonly MAX_KEYWORDS = 10;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private readonly service = inject(SmsService);
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  public id = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  override get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get groupsId(): FormArray {
    return this.form.get('groupsId') as FormArray;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.store.setHeader(this.headerData);
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.service.getUpdateSmsNotification(this.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.smsNotificationsDetail = res.data;
          this.dataSource = res.data;
          if (res.data.delay) {
            res.data.delay = this.formatDuration(res.data.delay);
          }
          if (res.data.interval) {
            res.data.interval = this.formatDuration(res.data.interval);
          }
          this.form.patchValue(res.data);
          this.populateGroupsId(res.data.groupsId);
          this.form.updateValueAndValidity();
        });
    }
  }

  private populateGroupsId(groups: any[]): void {
    const groupsArray = this.form.get('groupsId') as FormArray;
    groups.forEach(group => {
      groupsArray.push(this.fb.control(group));
    });
  }

  add(event: any): void {
    const input = event.input;
    const value = (event.target.value || '').trim();
    const numberValue = Number(value);
    this.messageService.clear();
    if (!value) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'ID группы не может быть пустым!'});
      setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }
    if (this.groupsId.value.includes(numberValue)) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'ID группы уже добавлен!'});
      setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }
    if (value.length > 30) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'ID группы не может превышать 30 цифр!'});
      setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }
    if (this.groupsId.length >= 5) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Можно добавить до 5 групп!'});
      setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }
    this.groupsId.push(this.fb.control(numberValue));
    this.chipInput().nativeElement.value = '';
    if (input) {
      input.value = '';
    }
  }

  handleChipKeydown(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
    }
  }

  remove(groupId: number): void {
    const index = this.groupsId.controls.findIndex(control => control.value === groupId);
    if (index >= 0) {
      this.groupsId.removeAt(index);
    }
  }

  formatDuration(duration: string): string {
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(duration)) {
      return '';
    }
    const durationParts = duration.split(':');
    const hours = parseInt(durationParts[0], 10);
    const minutes = parseInt(durationParts[1], 10);
    const seconds = durationParts[2] ? parseInt(durationParts[2], 10) : 0;
    return `${this.padWithZeroes(hours, 2)}:${this.padWithZeroes(minutes, 2)}${durationParts[2] ? ':' + this.padWithZeroes(seconds, 2) : ''}`;
  }

  padWithZeroes(num: number, length: number): string {
    return ('00' + num).slice(-length);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }

    this.submitted = true;

    let $observer: Observable<any>;

    if (this.updateUrl !== 'new') {
      $observer = this.service.updateSmsNotification({...this.smsNotificationsDetail, ...this.form.value});
    } else {
      $observer = this.service.createSmsNotification(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        takeUntil(this.destroyed$),
        finalize(() => {
          this.submitted = false;
          this.groupsId.clear(); // Clear chips if needed
          this.form.reset(); // Reset form
        })
      )
      .subscribe((res) => {
        if (res.status) {
          this.router.navigate(['promotion-system/list']);
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }


  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.id, Validators.required],
      message: ['', Validators.required],
      botHash: ['', Validators.required],
      triggerCount: [''],
      triggerPrice: [''],
      delay: ['', Validators.required],
      interval: [''],
      groupsId: this.fb.array([], [Validators.required, Validators.maxLength(5)]),
      isActive: [false, Validators.required],
    });
  }

}
