import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "@core/services";
import { IParam } from "@core/interfaces";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { AppealCategoryService } from "@modules/directory/appeal-category/services/appeal-category.service";
import { IAppealCategoryDetail } from "@modules/directory/appeal-category/interfaces/appeal-category-detail.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'em-appeal-category-edit',
  standalone: true,
  imports: [
    EmHeaderComponent,
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent
  ],
  templateUrl: './appeal-category-edit.component.html',
  styleUrl: './appeal-category-edit.component.scss',
  providers: [AppealCategoryService]
})
export class AppealCategoryEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  categoryDetail: IAppealCategoryDetail;
  submitted: boolean = false;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private categoryService = inject(AppealCategoryService);
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
    if (this.updateUrl !== 'new') {
      this.categoryService.getCategoryDetail(this.categoryId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          this.categoryDetail = res.data;
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
      $observer = this.categoryService.updateCategory({...this.categoryDetail, ...this.form.value});
    } else {
      $observer = this.categoryService.createCategory(this.form.value);
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
          this.router.navigate(['directory/appeal-category']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.categoryId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      description: [''],
      isActive: [false]
    });
  }
}
