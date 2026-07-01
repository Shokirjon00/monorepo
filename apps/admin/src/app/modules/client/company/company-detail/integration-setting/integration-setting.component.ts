import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { finalize, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { parseFilterParams } from '@core/utils/filter-util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IIntegration, IIntegrationSetting } from '@modules/client/company/company-detail/integration-setting/interfaces/integration-setting';
import { IntegrationSettingService } from '@modules/client/company/company-detail/integration-setting/services/integration-setting.service';
import { SharedModule } from '@shared/shared.module';
import { ValidatorComponent } from '@shared/components/validator/validator.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { EXPAND_DETAIL } from '@core/animations';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { IIntegrationType } from '@modules/client/company/company-detail/integration-setting/interfaces/integration-type';
import { MatDialog } from '@angular/material/dialog';
import { IntegrationTypeDialogComponent } from '@shared/dialogs/integration-type-dialog/integration-type-dialog.component';
import { IntegrationDialogComponent } from '@shared/dialogs/integration-dialog/integration-dialog.component';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from "@angular/material/chips";
import { MatFormField } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { NgOptimizedImage } from "@angular/common";
import {IpOrDomainValidator} from "@core/validators/domain-validator";
import {IP_OR_DOMAIN_PATTERN} from "@core/helper";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { IAction } from "@shared/components/actions/actions.interface";
import { ITab } from "@core/interfaces/header.interface";
import { MerchantConstants } from "@modules/client/merchant/merchant.constants";
import { IntegrationSettingsConstants } from "@modules/client/company/company-detail/integration-setting/integration-setting.constants";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { environment as env } from "@environments/environment";


@Component({
  standalone: true,
  selector: 'em-integration-setting',
  templateUrl: './integration-setting.component.html',
  styleUrls: ['./integration-setting.component.scss'],
  imports: [
    SharedModule,
    ValidatorComponent,
    SvgIconComponent,
    SimpleSelectListComponent,
    ToastComponent,
    ReactiveFormsModule,
    EbLoaderComponent,
    NgxPermissionsModule,
    MatChipGrid,
    MatChipInput,
    MatChipRemove,
    MatChipRow,
    MatFormField,
    MatIcon,
    NgOptimizedImage,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    AutocompleteComponent
  ],
  animations: [EXPAND_DETAIL]
})
export class IntegrationSettingComponent extends DestroyableComponent implements OnInit {
  readonly chipInput = viewChild<ElementRef>('chipInput');
  actions: IAction[];
  tabMenuItems: ITab[];
  companyId: string;
  loading: boolean = false;
  pagination: IPaginate | any;
  params: Params = {};
  captionKey = 'integration-setting';
  form: FormGroup;
  integrationSettings: IIntegrationSetting[];
  integrationType: IIntegrationType[];
  callBackMethods = [
    {id: 'c2a25cbf-f79b-4d58-bfed-572f2419660d', name: 'Pooling', isSelected: false},
    {id: 'b505b592-8d21-43ba-b71b-f9cb338a0723', name: 'Webhook', isSelected: false},
  ];
  apiBanksPath = `${env.api.fastQrApiAccessTypes}/${env.api.dictionary}`;
  removable: boolean = true;
  addOnBlur: boolean = true;
  pendingInput: boolean = false;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly permissionService = inject(NgxPermissionsService);
  private readonly service = inject(IntegrationSettingService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly store = inject(HeaderService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  constructor() {
    super();
    this.initTabData();
    this.getIntegrationType();
    this.createForm();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get groupsId(): FormArray {
    return this.form.controls['networkAddresses'] as FormArray;
  }

  ngOnInit(): void {
    this.getCompanyIntegrationConfiguration();
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.params = res;
        this.queryParams.page = res['page'];
        this.queryParams.pageSize = res['pageSize'];
        const params = parseFilterParams(res, this.queryParams, []);
        if (this.companyId) {
          this.queryParams.filters = `companyId==${this.companyId}`;
        }
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1;
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getIntegrationSettings(params);
        if (this.companyId) {
          this.changePage();
        }
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })

    this.store.getDialog()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res === 'integration-setting-save') {
          this.saveIntegrationConfiguration();
        }
      });
  }

  setNetworkAddresses(addresses?: string[]): void {
    const addressFormArray = this.groupsId;
    addressFormArray.clear();

    if (Array.isArray(addresses)) {
      addresses.forEach((address) => {
        addressFormArray.push(this.fb.control(address));
      });
    }
  }

  removeGroupById(groupId: number): void {
    const index = this.groupsId.controls.findIndex(control => control.value === groupId);
    if (index >= 0) {
      this.groupsId.removeAt(index);
    }
  }

  getCompanyIntegrationConfiguration(): void {
    this.service.getCompanyIntegrationConfigurations(this.companyId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.data) {
          this.form.patchValue(res.data);
          this.setNetworkAddresses(res.data.networkAddresses);
        }
      })
  }

  selectCallBack(methodId: string): void {
    this.form.get('connectionTypeId').setValue(methodId);
  }

  validatePendingInput(): void {
    if (this.pendingInput) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'После ввода адреса нажмите клавишу Enter, чтобы добавить его!'
      });
    }
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.pendingInput = inputElement.value.trim() !== '';
  }

  addApiAddress(event: any): void {
    const input = event.input;
    const value = (event.target.value || '').trim();
    const numberValue = String(value);
    const regex = new RegExp(IP_OR_DOMAIN_PATTERN);

    this.messageService.clear();
    this.pendingInput = false;

    if (!value) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Сетевые адреса не может быть пустым!' });
       this.setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }

    if (this.groupsId.value.includes(numberValue)) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Сетевые адреса уже добавлены!' });
      this.setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }

    if (this.groupsId.length >= 5) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Можно добавить до 5 групп!' });
      this.setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }

    if (!regex.test(value)) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Введите корректный IP-адрес или доменное имя!' });
       this.setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }

    this.groupsId.push(this.fb.control(numberValue));
    this.chipInput().nativeElement.value = '';

    if (input) {
      input.value = '';
    }
  }


  addIntegration(event: Event, integration: IIntegrationSetting): void {
    this.dialog.open(IntegrationDialogComponent, {
      id: 'integration-dialog',
      panelClass: 'custom-modalbox',
      data: {
        merchantId: integration.merchantId,
        path: 'new'
      },
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        this.store.dialogAction$.next(null);
        if (result) {
          this.getIntegrationDetail(integration);
        }
      });
    event.stopPropagation();
  }

  editIntegration(integrationType: IIntegration, integration: IIntegrationSetting): void {
    this.dialog.open(IntegrationDialogComponent, {
      data: {
        integrationId: integrationType.id,
        merchantId: integration.merchantId
      },
      panelClass: 'custom-modalbox'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.getIntegrationDetail(integration);
        }
      })
  }

  deleteIntegration(integrationType: IIntegration, integration: IIntegrationSetting): void {
    this.dialog.open(IntegrationTypeDialogComponent, {
      data: this.integrationType,
      maxWidth: '520px',
      panelClass: 'custom-modalbox',
    })
      .afterClosed()
      .subscribe(res => {
        if (res?.mode) {
          this.service.deleteIntegrationSetting({id: integrationType.id, moveId: res?.integrationType})
            .pipe(takeUntil(this.destroyed$))
            .subscribe(res => {
              if (res.status) {
                this.getIntegrationDetail(integration);
              }
              this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
            })
        }
    })
  }

  selectIntegrationType(integrationSettings: IIntegrationSetting, integration: IIntegration, moveIntegrationType: IIntegrationType): void {
    this.service.replaceIntegrationSetting({id: integration.id, moveId: moveIntegrationType.id, merchantId: integrationSettings.merchantId})
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        const msg = (res.errors && res.errors.moveId && res.errors.moveId[0]) || res.message;
        this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: msg});
        this.getIntegrationDetail(integrationSettings);
      });
  }

  openSettingDetail(integration: IIntegrationSetting): void {
    if (!integration.isActive) {
      this.loading = true;
      this.getIntegrationDetail(integration);
    } else {
      integration.isActive = false;
    }
  }

  private getIntegrationDetail(integration: IIntegrationSetting): void {
    this.service.getIntegrationSettingDetail(integration.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        if (res.status) {
          integration.integrations = res.data;
          integration.integrationCount = res.data.length;
          integration.isActive = true;
          this.loading = false;
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          this.loading = false;
        }
      });
  }

  private saveIntegrationConfiguration(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.service.updateCompanyIntegrationConfiguration(this.form.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message});
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          setValidationErrors(this.form, res);
        }
      })
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: ['', Validators.required],
      companyId: ['', Validators.required],
      connectionTypeId: ['', Validators.required],
      minVariation: ['', Validators.required],
      maxVariation: ['', Validators.required],
      pollingAttempts: ['', [Validators.required, this.rangeValidator(1, 100)]],
      orderTimeLimitSeconds: ['', Validators.required],
      fastQrApiAccessTypeId: ['', Validators.required],
      webhookUrl: '',
      networkAddresses: this.fb.array([], [ IpOrDomainValidator.validate(), Validators.maxLength(5)]),
      login: [{value: '', disabled: true}, Validators.required],
    });
  }

  private rangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === '') {
        return null;
      }
      const valid = value >= min && value <= max;
      return !valid ? { 'range': { value } } : null;
    };
  }

  private getIntegrationType(): void {
    this.service.getIntegrationTypesList()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.data) {
          this.integrationType = res.data;
        }
      })
  }

  private getIntegrationSettings(params = this.queryParams): void {
    this.loading = true;
    this.service.getIntegrationSettingList(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.data) {
          this.integrationSettings = res.data;
          this.pagination = res.meta.pagination;
        }
      })
  }

  private changePage(): void {
    this.store.getPageChange()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(pageChange => {
        if (pageChange) {
          this.queryParams.page = pageChange.pageNumber;
          this.queryParams.pageSize = pageChange.pageSize;
          this.router.navigate([],
            {
              relativeTo: this.route,
              queryParams: this.queryParams
            }).catch();
        }
      });
  }

  private initTabData(): void {
    this.store.getCompanyId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(companyId => {
        this.companyId = companyId;
        if (this.companyId) {
          this.getTabItems();
        }
      })
  }

  private getTabItems(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.tabMenuItems = res ? MerchantConstants.getHeaderAcquirerTabs(this.companyId) : MerchantConstants.getHeaderTabs(this.companyId);
        this.actions = IntegrationSettingsConstants.INTEGRATION_ACTION;
      });
  }
}
