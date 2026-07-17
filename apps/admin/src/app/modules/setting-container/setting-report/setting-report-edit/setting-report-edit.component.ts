import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, inject, Input, OnInit, viewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {finalize, of, takeUntil} from 'rxjs';
import {Location} from '@angular/common';
import {MessageService} from '@core/services/message.service';
import {ToastEnum} from '@eskhata/util';
import {delay, mergeMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {setValidationErrors} from '@core/validators/set-validation-errors';
import {EMBaseForm} from '@core/abstract/base-form.abstract';
import {IParam} from '@core/interfaces/param.interface';
import {HeaderService} from '@core/services/header.service';
import {ISetting} from '@modules/setting-container/setting/interfaces/setting.interface';
import {SettingReportService} from '@modules/setting-container/setting-report/services/setting-report.service';
import {IHeader} from '@core/interfaces/header.interface';
import {SvgIconComponent} from "angular-svg-icon";
import {ValidatorComponent} from "@shared/components/validator/validator.component";
import {UploadFieldComponent} from "@shared/components/upload-field/upload-field.component";
import {EbLoaderComponent} from "@shared/components/eb-loader/eb-loader.component";
import {ToastComponent} from "@shared/components/toast/toast.component";
import {CompanyService} from "@modules/client/company/services/company.service";
import {EmHeaderComponent} from "@shared/components/em-header/em-header.component";
import {HtmlViewerComponent} from "@shared/components/monaco-editor/html-viewer.component";

@Component({
  standalone: true,
  selector: 'em-setting-edit',
  templateUrl: './setting-report-edit.component.html',
  styleUrls: ['./setting-report-edit.component.scss'],
  providers: [SettingReportService, CompanyService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorComponent,
    UploadFieldComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    HtmlViewerComponent,
  ]
})
export class SettingReportEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile = {
    fileType: '.doc, .docx, .xls, .xlsx', memType: '.doc, .docx', uploadPath: 'client_reports/upload_template'
  };
  readonly htmlEditor = viewChild.required(HtmlViewerComponent);

  form: FormGroup;
  settingUpdate: ISetting;
  submitted: boolean = false;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  fileStorageUrl: string;
  fileStorageToken: string;

  private service = inject(SettingReportService);
  private fb = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private store = inject(HeaderService);
  private messageService = inject(MessageService);
  private settingReportId = this.activatedRoute.snapshot.params['id'];

  constructor(
    location: Location,
    dialog: MatDialog
  ) {
    super(location, dialog);
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.store.setHeader(this.headerData);
    this.creatForm();
    this.getSettingUpdate();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return;
    }

    this.submitted = true;

    const htmlEditor = this.htmlEditor();
    if (htmlEditor?.editorView) {
      this.form.patchValue({htmlCode: htmlEditor.editorView.state.doc.toString()});
    }

    const formData = {
      ...this.form.value,
      templateFileId: this.form.value.templateFileId?.toString()
    };

    this.service.updateSetting(formData)
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        takeUntil(this.destroyed$),
        finalize(() => this.submitted = false)
      )
      .subscribe(res => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  private getSettingUpdate(): void {
    this.service.getSettingUpdate(this.settingReportId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.settingUpdate = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          const htmlEditor = this.htmlEditor();
          if (htmlEditor) {
            htmlEditor.htmlCode();
            htmlEditor.initEditor(res.data.htmlCode || '');
          }
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.settingReportId],
      name: ['', [Validators.required]],
      templateFileId: [''],
      isActive: false,
      htmlCode: [''],
      paramsDescription: ['']
    });
  }
}
