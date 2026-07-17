import { Component, DestroyRef, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ToastEnum } from '@eskhata/util';
import { finalize, Observable, of, takeUntil } from "rxjs";
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { IParam, ISelect } from "@core/interfaces";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MessageService } from "@core/services";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { environment as env } from "@environments/environment";
import { UploadFieldComponent } from "@shared/components/upload-field/upload-field.component";
import { CompanyService } from "@modules/client/company/services/company.service";
import { AllowListService } from "@modules/advance-payments/allow-list/service/allow-list.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AccountService } from "@core/services/account.service";
import {
  AdvanceCommissionsService
} from "@modules/advance-payments/advance-commissions/services/advance.commissions.service";
import { IAllowListDetail } from "@modules/advance-payments/allow-list/interfaces/allow-list-detail";
import { IAccount } from "@modules/client/company/interfaces/account.interface";
import { IUploadFile } from "@shared/components/upload-field/upload-field.interface";

@Component({
  selector: 'em-allow-list-edit',
  standalone: true,
  imports: [
    EmHeaderComponent,
    FormsModule,
    NgxPermissionsModule,
    ReactiveFormsModule,
    SvgIconComponent,
    EbLoaderComponent,
    SimpleSelectListComponent,
    ToastComponent,
    ValidatorComponent,
    AutocompleteComponent,
    UploadFieldComponent
  ],
  templateUrl: './allow-list-edit.component.html',
  styleUrl: './allow-list-edit.component.scss',
  providers: [CompanyService, AccountService]
})
export class AllowListEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile: IUploadFile = {
    fileType: '.jpg, .jpeg',
    mimeType: 'application/pdf',
    uploadPath: 'advance_payout_offers/upload'
  };
  companyDictionaryApi = `${env.api.companies}/${env.api.dictionary}`;
  companyFilter = {eskhataAcquirer: 'Да'};
  fileStorageUrl: string;
  fileStorageToken: string;
  form: FormGroup = new FormGroup({});
  submitted = signal(false);
  isCompanyEditable: boolean = true;
  advance: IAccount[];
  settlements: IAccount[];
  commissions: ISelect[];
  companyId: string;
  private servicesDetail: IAllowListDetail;
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AllowListService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly commissionAdvancesService = inject(AdvanceCommissionsService)

  servicesId = this.route.snapshot.params['id'];
  updateUrl = this.route.snapshot.routeConfig.path;

  constructor() {
    super(inject(Location), inject(MatDialog));
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.getCommissions();
    this.creatForm();
    if (this.updateUrl !== 'new') {
      this.getServicesUpdate();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }

    this.submitted.set(true);

    const formValue = {...this.form.value};
    if (Array.isArray(formValue.contractFileId)) {
      formValue.contractFileId = formValue.contractFileId[0] || null;
    }

    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.updateAdvancePayout({...this.servicesDetail, ...formValue});
    } else {
      $observer = this.service.createAdvancePayout(formValue);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted.set(false)  ),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.location.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      companyId: ['', Validators.required],
      advancePayoutAccountId: ['', Validators.required],
      advanceRepaymentAccountId: ['', Validators.required],
      contractInfo: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      commissionId: ['', Validators.required],
      contractFileId: '',
      isActive: [false],
    });
  }

  private getServicesUpdate(): void {
    this.service.getUpdateDetail(this.servicesId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.form.patchValue(res.data);
          this.form.updateValueAndValidity();
          this.servicesDetail = res.data;
          this.isCompanyEditable = res.data.isCompanyEditable;
          this.dataSource = res.data;
          this.applyFormAccessibility();
        }
      });
  }

  selectedCompany(companyId: string): void {
    if (companyId != this.servicesDetail?.companyId) {
      this.form.get('advancePayoutAccountId').setValue(null);
      this.form.get('advanceRepaymentAccountId').setValue(null)
    }
    if (companyId) {
      this.getAdvanceCreditAccount(companyId);
      this.getAdvanceSettlements(companyId);
    }
  }

  private getAdvanceCreditAccount(companyId: string): void {
    this.accountService.getDemands(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.advance = res.data;
        }
      });
  }

  private getAdvanceSettlements(companyId: string): void {
    this.accountService.getSettlements(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.settlements = res.data;
        }
      });
  }

  private getCommissions(): void {
    this.commissionAdvancesService.getCommissionDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.commissions = res.data;
        }
      });
  }

  private applyFormAccessibility(): void {
    if (!this.isCompanyEditable) {
      this.form.get('companyId')?.disable({ emitEvent: false });
    } else {
      this.form.get('companyId')?.enable({ emitEvent: false });
    }
  }
}
