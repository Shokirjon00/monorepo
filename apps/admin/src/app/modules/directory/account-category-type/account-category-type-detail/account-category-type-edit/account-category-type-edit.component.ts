import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IAccountCategoryType
} from '@modules/directory/account-category-type/interfaces/account-category-type.interface';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  AccountCategoryTypeService
} from '@modules/directory/account-category-type/services/account-category-type.service';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
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
  selector: 'em-account-category-type-edit',
  templateUrl: './account-category-type-edit.component.html',
  styleUrls: ['./account-category-type-edit.component.scss'],
  providers: [AccountCategoryTypeService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
]
})
export class AccountCategoryTypeEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  acCatTyDetail: IAccountCategoryType;
  submitted: boolean = false;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AccountCategoryTypeService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  private acCatTyId? = this.activatedRoute.snapshot.parent.params['acTypeId'];
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
      this.service.getAccountCategoryTypeDetail(this.acCatTyId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.acCatTyDetail = res.data;
          this.dataSource = res.data
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
      $observer = this.service.update({...this.acCatTyDetail, ...this.form.value});
    } else {
      $observer = this.service.create(this.form.value);
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
          this.router.navigate(['directory/account-category-type']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.acCatTyId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      position: [1, [Validators.required, Validators.min(1)]],
      isActive: [false]
    });
  }
}
