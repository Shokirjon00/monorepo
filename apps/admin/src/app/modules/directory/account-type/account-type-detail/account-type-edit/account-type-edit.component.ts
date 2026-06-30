import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISelect } from '@core/interfaces/select.interface';
import { IAccountType } from '@modules/directory/account-type/interfaces/account-type.interface';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { AccountTypeService } from '@modules/directory/account-type/services/account-type.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { GatewaysService } from '@core/services/gateways.service';
import {
  AccountCategoryTypeService
} from '@modules/directory/account-category-type/services/account-category-type.service';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-account-type-edit',
  templateUrl: './account-type-edit.component.html',
  styleUrls: ['./account-type-edit.component.scss'],
  providers: [
    AccountTypeService,
    GatewaysService,
    AccountCategoryTypeService
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    SimpleSelectListComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class AccountTypeEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  acTypeDetail: IAccountType;
  gateways: ISelect[];
  accountCategoryTypes: ISelect[];
  accountClassificationId: ISelect[];
  submitted: boolean = false;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AccountTypeService);
  private readonly gatewaysService = inject(GatewaysService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly categoryTypeService = inject(AccountCategoryTypeService);
  private readonly messageService = inject(MessageService);

  private acTypeId? = this.activatedRoute.snapshot.parent.params['acTypeId'];
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
    this.getGateWays();
    this.getCategoryTypes();
    this.getTypeDictionary();
    if (this.updateUrl !== 'new') {
      this.service.getAccountTypeDetail(this.acTypeId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.acTypeDetail = res.data;
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
      $observer = this.service.update({...this.acTypeDetail, ...this.form.value});
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
          this.router.navigate(['directory/account-type']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.acTypeId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      code: ['', [
        WhiteSpaceValidator.validate(),
        Validators.required]],
      extCodeAbs: ['', [
        Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      extCodeObjectAbs:['',[
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      accountClassificationId:[''],
      gatewayId: ['', Validators.required],
      accountCategoryTypeId: ['', Validators.required],
      isActive: [false]
    });
  }

  private getGateWays(): void {
    this.gatewaysService.getTypeDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.gateways = res.data)
  }

  private getCategoryTypes(): void {
    this.categoryTypeService.getAccountCategoryTypeDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.accountCategoryTypes = res.data)
  }

  private getTypeDictionary(): void {
    this.service.getTypeDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.accountClassificationId = res.data)
  }
}
