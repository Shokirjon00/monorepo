import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '@modules/directory/category/services/category.service';
import { ICategoryDetail } from '@modules/directory/category/interfaces/category-detail.interface';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common'
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss'],
  providers: [],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class CategoryEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  categoryDetail: ICategoryDetail;
  submitted: boolean = false;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly categoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private categoryId = this.activatedRoute.snapshot.params['id'];
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
      this.categoryService.getCategoryDetail(this.categoryId)
        .pipe(takeUntil(this.destroyed$))
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
          this.router.navigate(['directory/categories']).catch();
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
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      isActive: [false]
    });
  }
}
