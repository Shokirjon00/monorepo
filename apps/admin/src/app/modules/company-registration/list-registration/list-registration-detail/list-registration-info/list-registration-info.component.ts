import {Component, DestroyRef, inject, Input, OnInit, signal} from '@angular/core';
import { NgxPermissionsModule } from "ngx-permissions";
import { CommonModule } from '@angular/common';
import {
  ICompanyRegistrationDetail
} from "@modules/company-registration/list-registration/interfaces/company-registration-detail.interfaces";
import { ActivatedRoute } from "@angular/router";
import {
  CompanyRegistrationApplicationsService
} from "@modules/company-registration/list-registration/services/company-registration.service";
import { finalize } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CompanyService } from "@modules/client/company/services/company.service";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { IAction } from "@shared/components/actions/actions.interface";
import {
  ListRegistrationDetailConstants
} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-info.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { ITab } from "@core/interfaces/header.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import {DynamicUploadFieldComponent} from "@shared/components/dynamic-upload-field/dynamic-upload-field.component";
import {ToastComponent} from "@shared/components/toast/toast.component";
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import {DateTimePipe} from "@core/pipe/date-time.pipe";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-list-registration-info',
  templateUrl: './list-registration-info.component.html',
  imports: [
    CommonModule,
    NgxPermissionsModule,
    ReactiveFormsModule,
    EbLoaderComponent,
    ActionsComponent,
    EmHeaderComponent,
    DynamicUploadFieldComponent,
    ToastComponent,
    DateTimePipe
  ],
  styleUrls: ['./list-registration-info.component.scss'],
  providers: [CompanyService]
})
export class ListRegistrationInfoComponent implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'company_registration_applications/upload_file',
  };
  listRegistrationId: string | any;
  loading = signal(false);
  companyRegistrationDetail: ICompanyRegistrationDetail;
  form: FormGroup;
  actions: IAction[];
  tabMenuItems: ITab[];
  fileStorageUrl: string;
  fileStorageToken: string;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CompanyRegistrationApplicationsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  constructor() {
    this.listRegistrationId = this.activatedRoute.snapshot.parent.params['id'];
    this.tabMenuItems = ListRegistrationDetailConstants.getHeaderTabs(this.listRegistrationId);
    this.actions = ListRegistrationDetailConstants.getActions(this.listRegistrationId);
  }

  ngOnInit(): void {
    this.createForm();
    this.getCompanyRegistrationDetail();
  }

  generatingApplication(): void {
    this.loading.set(true);
    this.service.getComponyRegistrationApplication(this.listRegistrationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });
      });
  }

  dorDispatch(): void {
    this.loading.set(true);
    const body = { id: this.listRegistrationId };
    this.service.componyRegistrationApplication(body as any)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });
      });
  }

  private getCompanyRegistrationDetail(): void {
    this.loading.set(true);
    this.service.getCompanyRegistrationDetail(this.listRegistrationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.companyRegistrationDetail = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.form.patchValue(res.data, {emitEvent: false})
        }
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      statementFileId: [''],
      offerFileId: [''],
      taxStatementFileId: [''],
      fileIds: [[]]
    });
  }
}
