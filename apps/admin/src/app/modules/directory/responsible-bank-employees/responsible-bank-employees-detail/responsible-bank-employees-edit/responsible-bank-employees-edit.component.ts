import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { Observable, of, takeUntil } from 'rxjs';
import { ToastEnum } from '@core/enums/toast-enum';
import { ResBankEmpService } from '@modules/directory/responsible-bank-employees/services/res-bank-emp.service';
import { IResBankEmp } from '@modules/directory/responsible-bank-employees/interfaces/res-bank-emp.interface';
import { delay, finalize, mergeMap } from 'rxjs/operators';
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
  selector: 'em-responsible-bank-employees-edit',
  templateUrl: './responsible-bank-employees-edit.component.html',
  styleUrls: ['./responsible-bank-employees-edit.component.scss'],
  providers: [ResBankEmpService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class ResponsibleBankEmployeesEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  loading: boolean;
  resBankEmpDetail: IResBankEmp;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ResBankEmpService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private resBankEmployeeId = this.activatedRoute.snapshot.params['id'];
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
      this.service.getResBankEmpDetail(this.resBankEmployeeId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.resBankEmpDetail = res.data;
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
      $observer = this.service.updateResBankEmp({...this.resBankEmpDetail, ...this.form.value});
    } else {
      $observer = this.service.createResBankEmp(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => {
          this.loading = false;
          this.submitted = false;
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
      id: [this.resBankEmployeeId],
      firstName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),]],
      lastName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),]],
      middleName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),]],
      positionName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false]
    });
  }
}
