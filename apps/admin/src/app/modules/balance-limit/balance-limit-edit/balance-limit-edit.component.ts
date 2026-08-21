import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { BalanceLimitService } from '@modules/balance-limit/services/balance-limit.service';
import { IBalanceLimit } from '@modules/balance-limit/Interfaces/balance-limit.interface';
import { Location } from '@angular/common'
import { MessageService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import { IHeader } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { NgxMaskDirective } from "ngx-mask";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-balance-limit-edit',
  templateUrl: './balance-limit-edit.component.html',
  styleUrls: ['./balance-limit-edit.component.scss'],
  providers: [BalanceLimitService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    ToastComponent,
    NgxMaskDirective,
    EmHeaderComponent,
    NgxPermissionsModule
  ]
})
export class BalanceLimitEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  balanceLimitDetail: IBalanceLimit;
  submitted: boolean = false;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };


  private readonly service = inject(BalanceLimitService);
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(HeaderService);
  private readonly messageService = inject(MessageService);

  private id = this.activatedRoute.snapshot.params['id'];
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
    this.store.setHeader(this.headerData);
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.service.getBalanceLimitDetail(this.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.balanceLimitDetail = res.data;
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
      $observer = this.service.updateBalanceLimit({...this.balanceLimitDetail, ...this.form.value});
    } else {
      $observer = this.service.createBalanceLimit(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        takeUntil(this.destroyed$),
        finalize(() => this.submitted = false)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.router.navigate(['balance-limit'])
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.id],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      value: ['', Validators.required],
      isActive: false,
    });
  }

}

