import { Component, inject, Input, OnInit } from '@angular/core';
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "@core/services/message.service";
import { IParam } from "@core/interfaces/param.interface";
import { WhiteSpaceValidator } from "@core/validators/white-space-validator";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { ToastEnum } from "@core/enums/toast-enum";
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { SvgIconComponent } from "angular-svg-icon";
import { ReactiveFormsModule } from '@angular/forms';
import { IJobLogTypeDetail } from "@modules/directory/job-log-types/interfaces/job-log-type-detail";
import { TypeListService } from "@modules/directory/job-log-types/services/job-log-type.service";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-job-log-types-edit',
  templateUrl: './job-log-types-edit.component.html',
  styleUrls: ['./job-log-types-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class JobLogTypesEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  jobLogDetail: IJobLogTypeDetail;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly jobLogTypeService = inject(TypeListService);
  private readonly route = inject(ActivatedRoute);
  private readonly jobLogTypesId = this.route.snapshot.params['id'];
  private readonly updateUrl = this.route.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.jobLogTypeService.getJobLogTypesDetail(this.jobLogTypesId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.jobLogDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
        });
    }
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
      $observer = this.jobLogTypeService.updateJobLogTypesDetail({...this.jobLogDetail, ...this.form.value});
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.jobLogTypesId],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false]
    });
  }
}
