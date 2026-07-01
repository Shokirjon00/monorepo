import { Component, inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { CashbackLimitService } from '@modules/directory/cashback-limit/services/cashback-limit.service';
import { ISelect } from '@core/interfaces/select.interface';
import { Location } from '@angular/common'
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { ICashbackLimitDetail } from '@modules/directory/cashback-limit/interfaces/cashback-limit-detail.interface';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { NgxMaskDirective } from "ngx-mask";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-cashback-limit-edit',
  templateUrl: './cashback-limit-edit.component.html',
  styleUrls: ['./cashback-limit-edit.component.scss'],
  providers: [CashbackLimitService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    SimpleSelectListComponent,
    ToastComponent,
    NgxMaskDirective,
    EmHeaderComponent
  ]
})
export class CashbackLimitEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  cashbackLimitDetail: ICashbackLimitDetail;
  cashbackLimitTypes: ISelect[];
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(CashbackLimitService);

  private cashbackLimitId = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  get limitParamJsonControls(): { [key: string]: AbstractControl } {
    return this.limitParamJson.controls;
  }

  get limitParamJson(): FormGroup {
    return this.form.get('limitParamJson') as FormGroup;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getTypes();
    if (this.updateUrl !== 'new') {
      this.getCashbackLimit()
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
      $observer = this.service.updateCashbackLimit({...this.cashbackLimitDetail, ...this.form.value});
    } else {
      $observer = this.service.createCashbackLimit(this.form.value);
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
        }
      );
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.cashbackLimitId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      limitParamJson: this.fb.group({
        amount: ['', Validators.required],
        cashbackLimitTypeId: ['', Validators.required]
      }),
      isActive: [false]
    });
  }

  private getCashbackLimit(): void {
    this.service.getCashbackLimitDetail(this.cashbackLimitId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.cashbackLimitDetail = res.data;
        this.dataSource = res.data;
        this.form.patchValue(res.data);
      });
  }

  private getTypes(): void {
    this.service.getCashbackLimitTypesDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.cashbackLimitTypes = res.data)
  }
}
