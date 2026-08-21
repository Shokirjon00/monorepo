import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent, SimpleSelectListComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import {
  IDirectoryOptionsDetail
} from "@modules/directory/directory-options/interfaces/directory-options-detail.interfaces";
import { ActivatedRoute } from "@angular/router";
import { DirectoryOptionsService } from "@modules/directory/directory-options/services/directory-options.service";
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { finalize, Observable, of, takeUntil } from "rxjs";
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { MessageService } from '@eskhata/data-access';
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { latinPatternValidator } from '@eskhata/util';
import { DirectoryOptionsConstants } from "@modules/directory/directory-options/directory-options.constants";

@Component({
  standalone: true,
  selector: 'em-directory-options-edit',
  templateUrl: './directory-options-edit.component.html',
  styleUrls: ['./directory-options-edit.component.scss'],
  imports: [
    FormsModule,
    NgxPermissionsModule,
    ReactiveFormsModule,
    SvgIconComponent,
    ToastComponent,
    ValidatorComponent,
    EmHeaderComponent,
    SimpleSelectListComponent
  ],
})
export class DirectoryOptionsEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  directoryOptionsDetail: IDirectoryOptionsDetail;
  submitted: boolean = false;
  type = DirectoryOptionsConstants.TYPE

  private readonly service = inject(DirectoryOptionsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private directoryOptionsId = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  ngOnInit(): void {
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.getDetail();
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
      $observer = this.service.update({...this.directoryOptionsDetail, ...this.form.value});
    } else {
      $observer = this.service.create(this.form.value);
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
      id: [this.directoryOptionsId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      key: ['', [Validators.required,
        Validators.maxLength(100), latinPatternValidator()]],
      isActive: [false],
      typeId: ['', [Validators.required]]
    });
  }

  private getDetail(): void {
    this.service.getDirectoryOptionsUpdateDetail(this.directoryOptionsId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
          this.dataSource = res.data;
          this.directoryOptionsDetail = res.data;
          this.form.patchValue(res.data);
        }
      );
  }
}
