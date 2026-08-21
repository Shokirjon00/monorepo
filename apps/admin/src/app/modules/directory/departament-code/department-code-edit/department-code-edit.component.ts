import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "@core/services";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { IParam } from "@core/interfaces";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { finalize, Observable, of } from "rxjs";
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { DepartmentCode } from "@modules/directory/departament-code/services/department-code";
import { IDepartmentCodeDetail } from "@modules/directory/departament-code/interfaces/department-code-detail";

@Component({
  selector: 'em-department-code-edit',
  imports: [
    EmHeaderComponent,
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent
  ],
  templateUrl: './department-code-edit.component.html',
  styleUrl: './department-code-edit.component.scss',
  providers: [DepartmentCode]
})
export class DepartmentCodeEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  departmentDetail: IDepartmentCodeDetail;
  submitted: boolean = false;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private service = inject(DepartmentCode);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private categoryId = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  private readonly destroyRef = inject(DestroyRef);

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
    this.loadDepartmentCode();
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
      $observer = this.service.updateDepartmentCode({...this.departmentDetail, ...this.form.value});
    } else {
      $observer = this.service.createDepartmentCode(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.router.navigate(['directory/department-code']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private loadDepartmentCode(): void {
    if (this.updateUrl !== 'new') {
      this.service.getDepartmentCodeDetail(this.categoryId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          this.departmentDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
        });
    }
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.categoryId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      extCodeAbs: ['', [
        Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      isActive: [false]
    });
  }
}
