import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CountryService } from '@modules/directory/country/services/country.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common'
import { ICountryDetail } from '@modules/directory/country/interfaces/country-detail.interface';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
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
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrls: ['./country-edit.component.scss'],
  providers: [CountryService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class CountryEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  countryDetail: ICountryDetail;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly countryService = inject(CountryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private countryId = this.activatedRoute.snapshot.params['id'];
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
      this.countryService.getCountryDetail(this.countryId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.countryDetail = res.data;
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
      $observer = this.countryService.updateCountry({...this.countryDetail, ...this.form.value});
    } else {
      $observer = this.countryService.createCountry(this.form.value);
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
      id: [this.countryId],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      description: [''],
      iso2: ['', [Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        WhiteSpaceValidator.validate()]],
      iso3: ['', [Validators.required,
        Validators.maxLength(3),
        WhiteSpaceValidator.validate()]],
      isActive: [false]
    });
  }
}
