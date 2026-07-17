import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from '@modules/directory/branch/services/branch.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { IBranchDetail } from '@modules/directory/branch/interfaces/branch-detail.interface';
import { Location } from '@angular/common';
import { IHeader } from '@core/interfaces/header.interface';
import { MessageService } from '@core/services/message.service';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-branch-edit',
  templateUrl: './branch-edit.component.html',
  styleUrls: ['./branch-edit.component.scss'],
  providers: [BranchService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class BranchEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  branchDetail: IBranchDetail;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private branchService = inject(BranchService);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);

  private branchId = this.activatedRoute.snapshot.params['id'];
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
      this.branchService.getBranchDetail(this.branchId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.branchDetail = res.data;
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
      $observer = this.branchService.updateBranch({...this.branchDetail, ...this.form.value});
    } else {
      $observer = this.branchService.createBranch(this.form.value);
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
            this.router.navigate(['directory/branch']).catch()
          } else {
            setValidationErrors(this.form, res);
          }
        }
      );
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.branchId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      extCodeAbs: ['', [Validators.required,
        WhiteSpaceValidator.validate()]],
      address: [''],
      isActive: [false]
    });
  }
}
