import { Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "@core/services";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { IParam } from "@core/interfaces";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastEnum } from '@eskhata/util';
import { finalize, Observable, of } from "rxjs";
import { delay, mergeMap} from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { WhiteSpaceValidator } from "@core/validators/white-space-validator";
import { IncomeCode } from "@modules/directory/income-code/services/income-code";
import { IncomeCodeDetail } from "@modules/directory/income-code/interfaces/income-code-detail";

@Component({
  selector: 'em-income-code-edit',
  imports: [
    EmHeaderComponent,
    FormsModule,
    NgxPermissionsModule,
    ReactiveFormsModule,
    SvgIconComponent,
    ToastComponent,
    ValidatorComponent
  ],
  templateUrl: './income-code-edit.component.html',
  styleUrl: './income-code-edit.component.scss',
  providers: [IncomeCode],
})
export class IncomeCodeEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  categoryDetail: IncomeCodeDetail;
  submitted: boolean = false;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private categoryService = inject(IncomeCode);
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
    this.createForm();
    this.loadCategory();
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
      $observer = this.categoryService.updateIncomeCode({...this.categoryDetail, ...this.form.value});
    } else {
      $observer = this.categoryService.createIncomeCode(this.form.value);
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
          this.router.navigate(['directory/income-code']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private loadCategory(): void {
    if (this.updateUrl === 'new') return;

    this.categoryService.getIncomeCodeDetail(this.categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const data = res.data;
        this.categoryDetail = data;
        this.dataSource = data;
        this.form.patchValue(data);
      });
  }

  private createForm(): void {
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
