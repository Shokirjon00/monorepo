import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ISelect} from '@core/interfaces/select.interface';
import {ActivatedRoute} from '@angular/router';
import {finalize, Observable, of} from 'rxjs';
import {Location} from '@angular/common'
import {IHeader} from '@core/interfaces/header.interface';
import {HeaderService} from '@core/services/header.service';
import {MessageService} from '@core/services/message.service';
import {ToastEnum} from '@core/enums/toast-enum';
import {delay, mergeMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {setValidationErrors} from '@core/validators/set-validation-errors';
import {WhiteSpaceValidator} from '@core/validators/white-space-validator';
import {EMBaseForm} from '@core/abstract/base-form.abstract';
import {IParam} from '@core/interfaces/param.interface';
import {SvgIconComponent} from "angular-svg-icon";
import {NgxPermissionsModule} from "ngx-permissions";
import {ValidatorComponent} from "@shared/components/validator/validator.component";
import {ToastComponent} from "@shared/components/toast/toast.component";
import {EmHeaderComponent} from "@shared/components/em-header/em-header.component";
import {ApplicationStatusService} from "@modules/directory/application-status/services/application-status.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IMerchantApplicationDetail} from "@modules/directory/application-status/interfaces/city-detail.interface";
import {AutocompleteComponent} from "@shared/components/autocomplete/autocomplete.component";
import {environment as env} from "@environments/environment";

@Component({
  standalone: true,
  selector: 'em-application-status-edit',
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.scss'],
  providers: [ApplicationStatusService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent,
    AutocompleteComponent
  ]
})
export class ApplicationStatusEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  merchantApplicationStatusDetail: IMerchantApplicationDetail;
  areas: ISelect[];
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;
  applicationTypesApi = `${env.api.applicationTypes}/${env.api.dictionary}`;

  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private service = inject(ApplicationStatusService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private applicationStatusId = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog
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
      this.service.getMerchantApplicationStatusDetail(this.applicationStatusId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          this.merchantApplicationStatusDetail = res.data;
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
      $observer = this.service.updateMerchantApplicationStatus({...this.merchantApplicationStatusDetail, ...this.form.value});
    } else {
      $observer = this.service.createMerchantApplicationStatus(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
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
      id: [this.applicationStatusId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      notificationText: ['', Validators.required],
      canNotify: [false, Validators.required],
      applicationTypeId: ['', Validators.required],
      isActive: [false]
    });
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
