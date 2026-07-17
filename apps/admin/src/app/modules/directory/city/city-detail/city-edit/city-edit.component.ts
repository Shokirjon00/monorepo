import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISelect } from '@core/interfaces/select.interface';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { AreaService } from '@modules/directory/area/services/area.service';
import { ICityDetail } from '@modules/directory/city/interfaces/city-detail.interface';
import { CityService } from '@modules/directory/city/services/city.service';
import { Location } from '@angular/common'
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { environment } from '@environments/environment';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss'],
  providers: [CityService],
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
export class CityEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  cityDetail: ICityDetail;
  areas: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  api = environment.api;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly cityService = inject(CityService);
  private readonly areaService = inject(AreaService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);

  private cityId = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
    this.initData();
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getAreas();
    if (this.updateUrl !== 'new') {
      this.cityService.getCityDetail(this.cityId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.cityDetail = res.data;
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
      $observer = this.cityService.updateCity({...this.cityDetail, ...this.form.value});
    } else {
      $observer = this.cityService.createCity(this.form.value);
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
      id: [this.cityId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      position: [0],
      areaId: ['', Validators.required],
      isActive: [false]
    });
  }

  private getAreas(): void {
    this.areaService.getAreaDictionary({})
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.areas = res.data)
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
