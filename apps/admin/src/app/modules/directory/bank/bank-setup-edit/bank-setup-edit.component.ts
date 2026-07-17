import { Component, ElementRef, inject, Input, OnInit, viewChild } from '@angular/core';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { IHeader, IParam } from "@core/interfaces";
import { Location, NgOptimizedImage } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { MessageService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { finalize, Observable, of, takeUntil } from "rxjs";
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { EMBaseForm } from "@core/abstract/base-form.abstract";
import { ClipboardService } from "ngx-clipboard";
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from "@angular/material/chips";
import { MatFormField } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { IpOrDomainValidator } from "@core/validators/domain-validator";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { IP_OR_DOMAIN_PATTERN } from "@core/helper";
import { ToastComponent } from "@shared/components/toast/toast.component";
import {
  BankIntegrationConfigurationsService
} from "@modules/directory/bank/services/bank-integration-configurations.service";
import { IBankIntegration } from "@modules/directory/bank/interfaces/bank.interface";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ToggleVisibilityButtonComponent } from "@shared/components/toggle-visibility-button/toggle-visibility-button.component";

@Component({
  standalone: true,
  selector: 'em-gateway-setup-edit',
  templateUrl: './bank-setup-edit.component.html',
  styleUrl: './bank-setup-edit.component.scss',
  imports: [
    EmHeaderComponent,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    ReactiveFormsModule,
    MatFormField,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatChipInput,
    NgOptimizedImage,
    ToastComponent,
    MatChipRemove,
    SimpleSelectListComponent,
    ToggleVisibilityButtonComponent
],
  providers: [BankIntegrationConfigurationsService]
})
export class BankSetupEditComponent extends EMBaseForm implements OnInit {
  readonly chipInput = viewChild<ElementRef>('chipInput');
  form: FormGroup;
  accessTypesId: IBankIntegration[];
  gatewaysSetup: IBankIntegration;
  isOpen: boolean = true;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;
  addOnBlur = true;
  removable = true;
  isOpenMap: IParam = {
    privateKey: false,
    apiKey: false
  };
  pendingInput: boolean = false;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly MAX_ADDRESSES = 20;

  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private service = inject(BankIntegrationConfigurationsService);
  private activatedRoute = inject(ActivatedRoute);
  private clipboardService = inject(ClipboardService);
  private bankId = this.activatedRoute.snapshot.params['id'];

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  maskedValue(fieldName: string): string {
    const value = this.form.get(fieldName)?.value || '';
    return '*'.repeat(value.length);
  }

  get groupsId(): FormArray {
    return this.form.controls['networkAddresses'] as FormArray;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getGatewaysSetup();
    this.getAccessTypes();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;

    let $observer: Observable<any>;

    const body = {
      bankId: this.bankId,
      webhookUrl: this.form.get('webhookUrl').value,
      refundUrl: this.form.get('refundUrl').value,
      networkAddresses: this.form.get('networkAddresses').value,
      externalApiAccessTypeId: this.form.get('externalApiAccessTypeId').value,
    };

      $observer = this.service.update(body);

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0));
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

  toggleVisibility(fieldName: string): void {
    this.isOpenMap[fieldName] = !this.isOpenMap[fieldName];
  }

  copyHashKey(fieldName: string): void {
    const value = this.form.get(fieldName)?.value;
    if (!value) {
      return;
    }
    this.clipboardService.copy(value);
    let summaryMessage = '';
    if (fieldName === 'apiKey') {
      summaryMessage = 'API-ключ скопирован!';
    } else if (fieldName === 'privateKey') {
      summaryMessage = 'Секретный ключ скопирован!';
    }

    this.messageService.add({ severity: ToastEnum.SUCCESS, summary: summaryMessage });
  }

  removeGroupById(groupId: number): void {
    const index = this.groupsId.controls.findIndex(control => control.value === groupId);
    if (index >= 0) {
      this.groupsId.removeAt(index);
    }
  }

  setNetworkAddresses(addresses: string[]): void {
    const addressFormArray = this.groupsId;
    addressFormArray.clear();
    addresses?.forEach((address) => {
      addressFormArray.push(this.fb.control(address));
    });
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

    if (this.groupsId.length >= this.MAX_ADDRESSES){
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Можно добавить до 20 адресов!' });
      this.setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }

    if (!regex.test(value)) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Укажите IP-адрес, example: 192.168.0.1' });
      this.setTimeout(() => this.chipInput().nativeElement.focus(), 0);
      return;
    }

    this.groupsId.push(this.fb.control(numberValue));
    this.chipInput().nativeElement.value = '';

    if (input) {
      input.value = '';
    }
  }

  private getAccessTypes(): void {
    this.service.getAccessTypesId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.accessTypesId = res.data;
        }
      })
  }

  private getGatewaysSetup(): void {
    this.service.getGatewaysSetup(this.bankId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.gatewaysSetup = res.data;
        this.dataSource = res.data;
        this.form.patchValue(res.data);
        this.setNetworkAddresses(res.data.networkAddresses);
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      gatewayId: [this.bankId],
      apiKey: [''],
      webhookUrl: [''],
      refundUrl: [''],
      privateKey: [''],
      externalApiAccessTypeId: ['', Validators.required],
      networkAddresses: this.fb.array([''], [ IpOrDomainValidator.validate(), Validators.maxLength(this.MAX_ADDRESSES), Validators.required]),
    });
  }

}
