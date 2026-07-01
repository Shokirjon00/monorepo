import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ICompanySegment } from '@modules/directory/company-segment/interfaces/company-segment.interface';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { CompanySegmentService } from '@modules/directory/company-segment/services/company-segment.service';
import { Location } from '@angular/common';
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-company-segment-edit',
  templateUrl: './company-segment-edit.component.html',
  styleUrls: ['./company-segment-edit.component.scss'],
  providers: [CompanySegmentService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class CompanySegmentEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  companySegmentDetail: ICompanySegment;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CompanySegmentService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private segmentId = this.activatedRoute.snapshot.params['segmentId'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    dialog: MatDialog,
    location: Location,
  ) {
    super(location, dialog);
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.service.getCompanySegmentDetail(this.segmentId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.companySegmentDetail = res.data;
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
      $observer = this.service.updateCompanySegment({...this.companySegmentDetail, ...this.form.value});
    } else {
      $observer = this.service.createCompanySegment(this.form.value);
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
          this.back()
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.segmentId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      isActive: [false]
    });
  }
}
