import { Location } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IHeader } from '@core/interfaces/header.interface';
import { ISelect } from '@core/interfaces/select.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { environment } from '@environments/environment';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { PaymentPurposesService } from "@modules/directory/payment-purposes/services/payment-purposes.service";
import {
  IPaymentPurposesDetail
} from "@modules/directory/payment-purposes/interfaces/payment-purposes-detail.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

interface IParameters {
  key: string;
  description: string;
}

const Parameters: IParameters[] = [
  {key: '{company_name}', description: 'Название организации'},
  {key: '{company_inn}', description: 'ИНН организации'},
  {key: '{merchant_name}', description: 'Название мерчанта'},
  {key: '{merchant_city_name}', description: 'Город мерчанта'},
  {key: '{merchant_city_area_name}', description: 'Название района торгового города'},
  {key: '{issue_start_at}', description: 'Начало вывода'},
  {key: '{issue_end_at}', description: 'Дата окончания вывода'},
  {key: '{payment_created_at}', description: 'Дата создания платежа'}
];

@Component({
  standalone: true,
  selector: 'em-payment-purposes-edit',
  templateUrl: './payment-purposes-edit.component.html',
  styleUrls: ['./payment-purposes-edit.component.scss'],
  providers: [PaymentPurposesService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class PaymentPurposesEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  areaDetail: IPaymentPurposesDetail;
  regions: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  api = environment.api;
  submitted: boolean = false;
  draggedKey: string | null = null;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly areaService = inject(PaymentPurposesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  public areaId = this.activatedRoute.snapshot.params['id'];
  protected readonly parameters = Parameters;
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
      this.areaService.getAreaDetail(this.areaId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.areaDetail = res.data;
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
      $observer = this.areaService.update({...this.areaDetail, ...this.form.value});
    } else {
      $observer = this.areaService.create(this.form.value);
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
          this.router.navigate(['directory/payment-purposes']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  onDragStart(key: string, event: DragEvent): void {
    this.draggedKey = key;
    event.dataTransfer?.setData('text/plain', key);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDropIntoInput(event: DragEvent, controlName: string): void {
    event.preventDefault();

    if (this.draggedKey) {
      const control = this.form.get(controlName);
      const currentValue: string = control?.value || '';
      if (!currentValue.includes(this.draggedKey)) {
        control?.setValue(currentValue + (currentValue ? ' ' : '') + this.draggedKey);
      }

      this.draggedKey = null;
    }
  }

  onDragEnd(): void {
    this.draggedKey = null;
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.areaId],
      templateText: ['', Validators.required],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false]
    });
  }
}
