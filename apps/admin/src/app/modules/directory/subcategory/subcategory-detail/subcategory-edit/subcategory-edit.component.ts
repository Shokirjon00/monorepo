import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ISubcategoryDetail } from '@modules/directory/subcategory/interfaces/subcategory-detail.interface';
import { SubcategoryService } from '@modules/directory/subcategory/services/subcategory.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ISelect } from '@core/interfaces/select.interface';
import { Location } from '@angular/common'
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { environment as env } from '@environments/environment';
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
  selector: 'em-category-edit',
  templateUrl: './subcategory-edit.component.html',
  styleUrls: ['./subcategory-edit.component.scss'],
  providers: [SubcategoryService],
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
export class SubcategoryEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  subcategoryDetail: ISubcategoryDetail;
  categories: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;
  categoryApi = `${env.api.categories}/${env.api.dictionary}`;
  private readonly fb = inject(FormBuilder);
  private readonly subcategoryService  = inject(SubcategoryService);
  private readonly headerService = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private subCategoryId = this.activatedRoute.snapshot.params['id'];
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
    if (this.updateUrl !== 'new') {
      this.subcategoryService.getSubcategoryDetail(this.subCategoryId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.dataSource = res.data;
          this.subcategoryDetail = res.data;
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
      $observer = this.subcategoryService.updateSubcategory({...this.subcategoryDetail, ...this.form.value});
    } else {
      $observer = this.subcategoryService.createSubcategory(this.form.value);
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
      id: [this.subCategoryId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      parentId: ['', Validators.required],
      isActive: [false]
    });
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
