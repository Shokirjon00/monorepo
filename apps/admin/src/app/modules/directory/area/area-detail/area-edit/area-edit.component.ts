import { Location } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IHeader } from '@eskhata/util';
import { ISelect } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { AreaService } from '@modules/directory/area/services/area.service';
import { RegionService } from '@modules/directory/region/services/region.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAreaDetail } from '@modules/directory/area/interfaces/area-detail.interface';
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
  selector: 'em-destination-template-edit',
  templateUrl: './area-edit.component.html',
  styleUrls: ['./area-edit.component.scss'],
  providers: [AreaService, RegionService],
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
export class AreaEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  areaDetail: IAreaDetail;
  regions: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  api = environment.api;
  submitted: boolean = false;

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private areaService = inject(AreaService);
  private headerService = inject(HeaderService);
  private regionService = inject(RegionService);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  public areaId = this.activatedRoute.snapshot.params['id'];
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
    this.getRegions();
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
          this.router.navigate(['directory/area']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.areaId],
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
      regionId: ['', Validators.required],
      description: [''],
      isActive: [false]
    });
  }

  private getRegions(): void {
    this.regionService.getRegionDictionary({})
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.regions = res.data)
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
