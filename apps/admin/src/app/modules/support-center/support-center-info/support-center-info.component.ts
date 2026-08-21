import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { EmHeaderComponent, MessageCardComponent, ToastComponent, UploadFieldComponent, ValidatorComponent } from '@eskhata/ui';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { SupportCenterService } from "@modules/support-center/services/support-center.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { finalize, of } from "rxjs";
import { CompanyService } from "@modules/client/company/services/company.service";
import { delay, mergeMap } from "rxjs/operators";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  selector: 'em-support-center-info',
  standalone: true,
  imports: [
    EmHeaderComponent,
    ReactiveFormsModule,
    UploadFieldComponent,
    MessageCardComponent,
    ToastComponent,
    EbLoaderComponent,
    ValidatorComponent
  ],
  templateUrl: './support-center-info.component.html',
  styleUrl: './support-center-info.component.scss',
  providers: [SupportCenterService,  CompanyService,],
})
export class SupportCenterInfoComponent implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg',
    memType: 'image/jpg',
    uploadPath: 'support_applications/upload',
  };
  loading = signal(false);
  form: FormGroup = new FormGroup({});
  submitted = false;
  fileStorageUrl?: string;
  fileStorageToken?: string;
  fileIds: any;
  supportDetail: any
  isUploadVisible = true;

  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly supportCenterService = inject(SupportCenterService);
  supportId = this.activatedRoute.snapshot.params['id'];


  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.getSupportDetail();
  }

  onCreateAppeal(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { message, fileIds } = this.extractFormValues();

    if (!this.hasValidPayload(message, fileIds)) {
      this.showValidationError();
      return;
    }

    const body = this.buildRequestBody(message, fileIds);

    this.submitted = true;

    this.sendAppeal(body);
  }

  private extractFormValues(): { message?: string, fileIds?: string[] } {
    const message: string | undefined = this.form.get('message')?.value?.trim();

    const rawFiles = this.form.get('attachedFile')?.value || [];

    const fileIdsArray: string[] = rawFiles
      .map((file: any) => typeof file === 'string' ? file : file?.id)
      .filter(Boolean);

    const fileIds = fileIdsArray.length > 0 ? fileIdsArray : undefined;

    return { message, fileIds };
  }

  private hasValidPayload(message?: string, fileIds?: string[]): boolean {
    return Boolean(message || fileIds?.length > 0);
  }

  private showValidationError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Пожалуйста, введите сообщение или прикрепите файл'
    });
  }

  private buildRequestBody(message?: string, fileIds?: string[]): any {
    const body: any = {
      supportApplicationId: this.supportId
    };

    if (message) body.message = message;
    if (fileIds) body.fileIds = fileIds;

    return body;
  }

  private sendAppeal(body: any): void {
    this.supportCenterService.send_message(body)
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        if (res.status) {
          this.getSupportDetail();
        }
        this.resetForm();
      });
  }

  private resetForm(): void {
    this.form.reset()
    this.isUploadVisible = false;
    setTimeout(() => this.isUploadVisible = true, 0);
  }

  private getSupportDetail(): void {
    this.loading.set(true);
    this.supportCenterService.getSupportDetail(this.supportId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.supportDetail = res.data;
        this.fileStorageUrl = res.meta.fileStorageUrl;
        this.fileStorageToken = res.meta.fileStorageToken;
        this.fileIds = res.data.supportApplicationMessages.map(
          (message: any) => message.fileIds || []
        );
      })
  }

  private createFormGroup(): void {
    this.form = this.fb.group({
      name: '',
      supportApplicationCategoryId: '',
      message: ['',[
        WhiteSpaceValidator.validate(),
        Validators.maxLength(500)]],
      contactPhoneNumber: '',
      contactEmail: '',
      attachedFile: '',
    })
  }
}

