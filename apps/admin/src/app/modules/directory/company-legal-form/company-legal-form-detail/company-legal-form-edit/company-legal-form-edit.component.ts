import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ICompanyLegalForm } from '@modules/directory/company-legal-form/interfaces/company-legal-form.interface';
import { Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from '@eskhata/data-access';
import { MatDialog } from '@angular/material/dialog';
import { CompanyLegalFormService } from '@modules/directory/company-legal-form/services/company-legal-form.service';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, finalize, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-company-legal-form-edit',
  templateUrl: './company-legal-form-edit.component.html',
  styleUrls: ['./company-legal-form-edit.component.scss'],
  providers: [CompanyLegalFormService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class CompanyLegalFormEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  loading: boolean;
  legalDetail: ICompanyLegalForm;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CompanyLegalFormService);
  private readonly messageService  = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private legalFormId = this.activatedRoute.snapshot.params['legalFormId'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

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
      this.service.getLegalFormDetail(this.legalFormId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.legalDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
        });
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;

    let $observer: Observable<any>;

    if (this.updateUrl !== 'new') {
      $observer = this.service.update({...this.legalDetail, ...this.form.value});
    } else {
      $observer = this.service.create(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => {
          this.submitted = false;
          this.loading = false;
        }),
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
      id: [this.legalFormId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      isActive: [false]
    });
  }
}
