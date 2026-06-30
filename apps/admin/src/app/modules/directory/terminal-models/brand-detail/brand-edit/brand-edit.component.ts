import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandService } from '../../services/brand.service';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable, timer } from 'rxjs';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { CommonModule, Location } from '@angular/common';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ISubcategoryDetail } from "@modules/directory/subcategory/interfaces/subcategory-detail.interface";
import { IHeader, IParam, ISelect } from "@core/interfaces";
import { HeaderService, MessageService } from "@core/services";
import { MatDialog } from "@angular/material/dialog";
import { ToastEnum } from "@core/enums/toast-enum";
import { delayWhen, tap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { WhiteSpaceValidator } from "@core/validators/white-space-validator";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IBrandDetail } from "@modules/directory/terminal-models/interfaces/brand-detail.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-brand-edit',
  templateUrl: './brand-edit.component.html',
  styleUrls: ['./brand-edit.component.scss'],
  imports: [ReactiveFormsModule, EmHeaderComponent, CommonModule, NgxPermissionsModule, SvgIconComponent, ToastComponent, ValidatorComponent]
})
export class BrandEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  brandDetail: ISubcategoryDetail;
  categories: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;
  private readonly fb = inject(FormBuilder);
  private readonly brandService = inject(BrandService);
  private readonly headerService = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private modelTerminalId = this.activatedRoute.snapshot.params['id'];
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
    this.loadBrandDetail();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return;
    }
    this.submitted = true;

    let $observer: Observable<IHttpResponse<IBrandDetail>>;

    if (this.updateUrl !== 'new') {
      $observer = this.brandService.updateBrand({...this.brandDetail, ...this.form.value});
    } else {
      $observer = this.brandService.createBrand(this.form.value);
    }

    $observer
      .pipe(
        tap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        }),
        delayWhen(res => timer(res.status ? 2000 : 0)),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
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

  private loadBrandDetail(): void {
    if (this.updateUrl === 'new') return;
    this.brandService.getBrandById(this.modelTerminalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.dataSource = res.data;
          this.brandDetail = res.data;
          this.form.patchValue(res.data);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.modelTerminalId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      description: [''],
      isActive: [false]
    });
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}

