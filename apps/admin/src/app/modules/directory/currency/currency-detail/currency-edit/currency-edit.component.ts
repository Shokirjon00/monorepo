import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from '@eskhata/data-access';
import { IParam } from '@eskhata/util';
import { CurrencyService } from "@modules/directory/currency/services/currency.service";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { ICurrencyDetail } from "@modules/directory/currency/interfaces/currency-detail.interfaces";
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  standalone: true,
  selector: 'em-currency-edit',
  templateUrl: './currency-edit.component.html',
  styleUrls: ['./currency-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    ToastComponent,
    NgxPermissionsModule,
    EmHeaderComponent
  ]
})
export class CurrencyEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  currencyDetail: ICurrencyDetail;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly route = inject(ActivatedRoute);
  private readonly currencyId = this.route.snapshot.params['id'];
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
      this.currencyService.getCurrencyDetail(this.currencyId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.currencyDetail = res.data;
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
      $observer = this.currencyService.updateCurrency({...this.currencyDetail, ...this.form.value});
    } else {
      $observer = this.currencyService.createCurrency(this.form.value);
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
      id: [this.currencyId],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      iso3: ['', [Validators.required,
        Validators.maxLength(3),
        WhiteSpaceValidator.validate()]],
      isActive: [false]
    });
  }
}
