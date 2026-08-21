import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegionService } from '@modules/directory/region/services/region.service';
import { CountryService } from '@modules/directory/country/services/country.service';
import { IRegionDetail } from '@modules/directory/region/interfaces/region-detail.interface';
import { ISelect } from '@eskhata/util';
import { Location } from '@angular/common'
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { environment } from '@environments/environment';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { AutocompleteComponent, EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-region-edit',
  templateUrl: './region-edit.component.html',
  styleUrls: ['./region-edit.component.scss'],
  providers: [RegionService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    AutocompleteComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class RegionEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  regionDetail: IRegionDetail;
  countries: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  api = environment.api;
  submitted: boolean = false;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly regionService = inject(RegionService);
  private readonly fb = inject(FormBuilder);
  private readonly countryService = inject(CountryService);
  private readonly headerService = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  regionId = this.activatedRoute.snapshot.params['id'];

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
    this.initData()
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getCountries();
    if (this.updateUrl !== 'new') {
      this.getDetail()
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
      $observer = this.regionService.update({...this.regionDetail, ...this.form.value});
    } else {
      $observer = this.regionService.create(this.form.value);
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
      id: [this.regionId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      code: ['', [Validators.required,
        Validators.maxLength(100)]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(50)]],
      countryId: ['', Validators.required],
      description: [''],
      isActive: [false]
    });
  }

  private getCountries(): void {
    this.countryService.getCountryDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.countries = res.data)
  }

  private getDetail(): void {
    this.regionService.getRegionDetail(this.regionId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
          this.dataSource = res.data;
          this.regionDetail = res.data;
          this.form.patchValue(res.data);
        }
      );
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
