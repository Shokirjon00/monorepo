import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input, OnDestroy,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { defer, delayWhen, finalize, Observable, of, takeUntil, timer } from 'rxjs';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { ISetting } from '@modules/setting-container/setting/interfaces/setting.interface';
import { SettingService } from '@modules/setting-container/setting/services/setting.service';
import { IHeader } from '@core/interfaces/header.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DynamicFieldsComponent } from "@shared/components/dynamic-fields/dynamic-fields.component";
import { IComponent } from "@modules/setting-container/setting/interfaces/components";
import { UpdateWithComponents } from "@modules/setting-container/setting/interfaces/update-with-components";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import { CompanyService } from '@modules/client/company/services/company.service';

@Component({
  standalone: true,
  selector: 'em-setting-edit',
  templateUrl: './setting-edit.component.html',
  styleUrls: ['./setting-edit.component.scss'],
  providers: [
    SettingService,
    CompanyService
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    DynamicFieldsComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class SettingEditComponent extends EMBaseForm implements OnInit, AfterViewInit, OnDestroy {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'settings/upload_file'
  };

  editorOptions!: JSONEditorOptions;
  form: FormGroup;
  settingUpdate: ISetting;
  dynamicFields: IComponent[];
  submitted = signal(false);
  settingJson: IParam;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };

  jsonData: any = {};
  fileStorageUrl: string;
  fileStorageToken: string;

  readonly editorContainer = viewChild<ElementRef>('jsonEditor');
  private editor!: JSONEditor;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly settingId = this.activatedRoute.snapshot.params['id'];
  private readonly service = inject(SettingService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  constructor(location: Location, dialog: MatDialog) {
    super(location, dialog);
  }

  get paramsForm(): FormGroup {
    return this.form.get('components') as FormGroup;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getSettingUpdate();
  }

  ngAfterViewInit(): void {
    if (this.settingUpdate?.components?.length) return;

    this.editorOptions = {
      mode: 'tree',
      modes: ['code', 'tree', 'view', 'text'],
      mainMenuBar: true,
      onChange: (): void => {
        const value = this.editor.get();
        this.onJsonChange(value);
      }
    };

    this.editor = new JSONEditor(
      this.editorContainer()!.nativeElement,
      this.editorOptions
    );
  }

  override ngOnDestroy(): void {
    this.editor?.destroy();
    super.ngOnDestroy();
  }

  onJsonChange(updatedJson: any): void {
    Object.assign(this.jsonData, this.trimJsonValues(updatedJson));
    this.form.get('settingJson')?.setValue(this.jsonData, { emitEvent: false });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.areComponentsValid()) {
      this.showError('Заполните все обязательные поля!');
      return;
    }

    defer(() => {
      const latestJson = this.editor?.get();
      if (latestJson) {
        this.form.get('settingJson')?.setValue(this.trimJsonValues(latestJson));
      }

      this.submitted.set(true);

      const componentsValues = this.form.get('components')?.value;
      const hasComponents = componentsValues && Object.keys(componentsValues).length > 0;

      return hasComponents
        ? this.updateWithComponents(componentsValues)
        : this.updateSetting();
    })
      .pipe(
        tap(res => this.showMessage(res)),
        delayWhen(res => res.status ? timer(2000) : of(0)),
        takeUntil(this.destroyed$),
        finalize(() => this.submitted.set(false))
      )
      .subscribe(res => this.handleResponse(res));
  }

  areComponentsValid(): boolean {
    if (!this.dynamicFields?.length) return true;

    const componentsValues = this.form.get('components')?.value;
    const flatValues = this.flattenObject(componentsValues);

    return this.dynamicFields.every(field => {
      const value = flatValues[field.name];

      switch (field.type) {
        case 'boolean':
          return value !== null && value !== undefined;
        case 'number':
          return value !== null && !isNaN(value);
        case 'file':
          return value !== null && value !== undefined && value !== '' &&
            (Array.isArray(value) ? value.length > 0 : true);
        default:
          return value !== null && value !== undefined && value !== '';
      }
    });
  }

  private updateWithComponents(componentsValues: UpdateWithComponents): Observable<IHttpResponse<UpdateWithComponents>> {
    const flatValues = this.flattenObject(componentsValues);

    const updatedParams = this.dynamicFields.map(field => {
      let value = flatValues[field.name];

      if (field.type === 'file' && Array.isArray(value)) {
        value = value.length > 0 ? value[0] : '';
      }

      return {
        ...field,
        value: value
      };
    });

    const payload = {
      id: this.form.get('id')?.value,
      description: this.form.get('description')?.value,
      components: updatedParams
    };

    return this.service.updateWithComponents(payload);
  }

  private flattenObject(obj: any, prefix = ''): any {
    return Object.keys(obj).reduce((acc: any, key) => {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, this.flattenObject(value, fullKey));
      } else {
        acc[fullKey] = value;
      }
      return acc;
    }, {});
  }

  private updateSetting(): Observable<any> {
    const rawForm = this.form.getRawValue();

    const payload = {
      ...rawForm,
      settingJson: JSON.stringify(rawForm.settingJson)
    };

    return this.service.updateSetting(payload);
  }

  private showMessage(res: any): void {
    this.messageService.add({
      severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
      summary: res.message
    });
  }

  private showError(msg: string): void {
    this.messageService.add({severity: ToastEnum.ERROR, summary: msg});
  }

  private handleResponse(res: any): void {
    if (res.status) {
      this.form.reset();
      this.back();
    } else {
      setValidationErrors(this.form, res);
    }
  }

  private getSettingUpdate(): void {
    this.service.getSettingUpdate(this.settingId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.settingUpdate = res.data;
        this.dynamicFields = res.data.components;
          if (res.meta) {
            this.fileStorageUrl = res.meta.fileStorageUrl;
            this.fileStorageToken = res.meta.fileStorageToken;
          }
          if (res.data.settingJson) {
            try {
              this.settingJson = JSON.parse(res.data.settingJson);
            } catch (e) {
              this.settingJson = {};
            }
          } else {
            this.settingJson = {};
          }

          this.form.get('settingJson')?.setValue(this.settingJson);

          this.dataSource = res.data;

          this.form.patchValue({
            id: res.data.id,
            code: res.data.code,
            description: res.data.description
          });

          if (this.editor && !this.dynamicFields?.length) {
            this.editor.set(this.settingJson);
          }

          this.setDynamicParams(this.dynamicFields);
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.settingId],
      code: [''],
      description: ['', Validators.required],
      settingJson: ['', Validators.required],
      components: this.fb.group({})
    });
    this.form.get('code')?.disable();
  }

  private setDynamicParams(fields: Array<IComponent>): void {
    if (!fields || !fields.length) return;

    const componentsGroup = this.fb.group({});

    fields.forEach(field => {
      const path = field.name.split('.');
      let validators: any = [];

      if (field.type === 'file') {
        validators = [Validators.required];
      } else if (field.type !== 'boolean') {
        validators = [Validators.required];
      }

      let initialValue = field.value;

      if (field.type === 'file' && this.settingJson && this.settingJson[field.name]) {
        initialValue = this.settingJson[field.name];
      }

      const control = this.fb.control(initialValue ?? '', validators);

      this.addNestedGroup(componentsGroup, path, control);
    });

    this.form.setControl('components', componentsGroup);
  }

  private addNestedGroup(currentGroup: FormGroup, path: string[], control: FormControl): void {
    if (path.length === 1) {
      currentGroup.addControl(path[0], control);
    } else {
      const key = path[0];
      let nextGroup = currentGroup.get(key) as FormGroup;
      if (!nextGroup) {
        nextGroup = this.fb.group({});
        currentGroup.addControl(key, nextGroup);
      }
      this.addNestedGroup(nextGroup, path.slice(1), control);
    }
  }

  private trimJsonValues(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim();
    } else if (Array.isArray(obj)) {
      return obj.map(v => this.trimJsonValues(v));
    } else if (typeof obj === 'object' && obj !== null) {
      const trimmedObj: any = {};
      Object.keys(obj).forEach(key => {
        trimmedObj[key.trim()] = this.trimJsonValues(obj[key]);
      });
      return trimmedObj;
    }
    return obj;
  }
}
