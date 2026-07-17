import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { delay, mergeMap, takeUntil } from 'rxjs/operators';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ISelect } from '@core/interfaces/select.interface';
import { ToastEnum } from '@eskhata/util';
import { finalize, Observable, of } from 'rxjs';
import { MessageService } from '@core/services/message.service';
import { IIntegration } from '@modules/client/merchant/interfaces/integration.interface';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { Params } from '@angular/router';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { ValidatorComponent } from '@shared/components/validator/validator.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { IntegrationSettingService } from '@modules/client/company/company-detail/integration-setting/services/integration-setting.service';
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { environment as env } from "@environments/environment";

@Component({
  standalone: true,
  selector: 'em-integration-dialog',
  templateUrl: './integration-dialog.component.html',
  styleUrls: ['./integration-dialog.component.scss'],
  imports: [
    SimpleSelectListComponent,
    ValidatorComponent,
    ReactiveFormsModule,
    MatDialogModule,
    CommonModule,
    ToastComponent,
    EbLoaderComponent,
    AutocompleteComponent,
    FormsModule
  ]
})
export class IntegrationDialogComponent extends DestroyableComponent implements OnInit {
  integrationDetail: any;
  form: FormGroup;
  params: FormGroup = this.fb.group({});
  jsonFormData: any;
  integrationTypes: ISelect[];
  orderTypes = `${env.api.orderTypes}`;
  submitted: boolean = false;
  loading: boolean = false;

  constructor(
    private matDialogRef: MatDialogRef<IntegrationDialogComponent>,
    private fb: FormBuilder,
    private messageService: MessageService,
    private service: IntegrationSettingService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    super();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get p(): { [key: string]: AbstractControl } {
    return this.params.controls;
  }

  ngOnInit(): void {
    this.createForm();
    this.getIntegrationTypes();
  }

  onSubmit(): void {
    this.form.markAllAsTouched()
    this.params.markAllAsTouched()
    if (this.form.invalid || this.params.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<any>;
    if (this.data.path !== 'new') {
      $observer = this.service.updateIntegrationSetting({...this.integrationDetail, ...this.form.value});
    } else {
      $observer = this.service.createIntegrationSetting(this.form.value);
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
          this.matDialogRef.close(true);
        } else {
          setValidationErrors(this.form, res);
          setValidationErrors(this.params, res);
        }
      });
  }

  selectedIntegration(item: IIntegration): void {
    if (item?.paramJson) {
      this.jsonFormData = JSON.parse(item.paramJson);
      this.jsonFormData.forEach((validation: any) => {
        const validatorsToAdd = [];
        for (const [key, value] of Object.entries(validation)) {
          switch (key) {
            case 'required':
              if (value) {
                validatorsToAdd.push(Validators.required);
              }
              break;
            case 'regex':
              if (value && typeof value === 'string') {
                validatorsToAdd.push(Validators.pattern(value));
              }
              break;
            case 'minLength':
              if (typeof value === 'number') {
                validatorsToAdd.push(Validators.minLength(value));
              }
              break;
            case 'maxLength':
              if (typeof value === 'number') {
                validatorsToAdd.push(Validators.maxLength(value));
              }
              break;
            default:
              break;
          }
        }
        this.params.addControl(validation.name, this.fb.control(validation.value, validatorsToAdd));
      });
    } else {
      this.jsonFormData = '';
    }
  }

  onDictionaryChange(index: number, event: string): void {
    this.form.get('integrationJson').setValue(`{"${this.jsonFormData[index].name}": ${event} }`);
  }

  private getIntegrationTypes(): void {
    this.service.getIntegrationTypesList()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.data) {
          this.integrationTypes = res.data;
          if (this.data.path !== 'new') {
            this.getDetail();
          }
        }
      })
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [this.data.id],
      merchantId: [this.data.merchantId, Validators.required],
      integrationTypeId: ['', Validators.required],
      integrationJson: [null],
    });
  }

  private getDetail(): void {
    this.service.getIntegrationSettingById(this.data.integrationId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.integrationDetail = res.data;
        this.form.patchValue(res.data);
        if (this.integrationDetail.integrationJson) {
          const paramjson: any = this.integrationTypes?.find((item: any) => item.id == this.integrationDetail.integrationTypeId);
          if (paramjson?.paramJson) {
            this.selectedIntegration(paramjson);
            const data: Params[] = JSON.parse(this.integrationDetail.integrationJson);
            Object.entries(data).forEach(([key, value]) => {
              this.params.controls[key].setValue(value);
            });
          }
        }
      });
  }
}
