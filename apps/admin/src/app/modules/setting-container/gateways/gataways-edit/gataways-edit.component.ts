import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IGatewaysDetail } from "@modules/setting-container/gateways/interfaces/gateways-detail";
import { IHeader } from "@core/interfaces/header.interface";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "@core/services/message.service";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { GatewaysService } from "@modules/setting-container/gateways/services/gateways.service";
import { IParam } from "@core/interfaces/param.interface";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { WhiteSpaceValidator } from "@core/validators/white-space-validator";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-gataways-edit',
  templateUrl: './gataways-edit.component.html',
  styleUrls: ['./gataways-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent
  ],
  providers: [GatewaysService]
})
export class GatawaysEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  gatewaysDetail: IGatewaysDetail;
  submitted: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly gatewaysService = inject(GatewaysService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private gatewaysId = this.activatedRoute.snapshot.params['id'];
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
      this.gatewaysService.getGatewaysDetail(this.gatewaysId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.gatewaysDetail = res.data;
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
      $observer = this.gatewaysService.updateGateways({...this.form.value});
    } else {
      $observer = this.gatewaysService.create(this.form.value);
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
      id: [this.gatewaysId],
      code: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      isActive: [false]
    });
  }
}
