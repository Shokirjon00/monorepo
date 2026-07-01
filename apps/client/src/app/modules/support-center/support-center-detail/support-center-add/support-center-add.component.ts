import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { ToastEnum } from '@eskhata/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from '@core/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { UploadFieldComponent } from '@shared/components/upload-field/upload-field.component';
import { PhoneValidator } from '@core/validators/phone-validator';
import { SupportCenterCategoryService } from '@modules/support-center/services/support-center-category.service';
import { ISelect } from '@core/interfaces/select.interface';
import { SupportCenterService } from '@modules/support-center';
import { switchMap, of } from 'rxjs';
import { ToastModule } from '@shared/components/toast/toast.module';

@Component({
  standalone: true,
  selector: 'em-support-center-add',
  templateUrl: './support-center-add.component.html',
  styleUrls: ['./support-center-add.component.scss'],
  imports: [
    EmHeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    SvgIconComponent,
    SimpleSelectListComponent,
    ValidatorModule,
    NgxMaskDirective,
    UploadFieldComponent,
    ToastModule,
  ],
  providers: [
    SupportCenterCategoryService,
    SupportCenterService,
    provideNgxMask()
  ]
})

export class SupportCenterAddComponent implements OnInit {
  formGroup: FormGroup;
  submitted = false;
  applicationCategories: ISelect[] = [];
  supportApplicationId: string | null = null;

  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly supportCenterService = inject(SupportCenterService);
  private readonly supportCenterCategoryService = inject(SupportCenterCategoryService);

  get f(): any {
    return this.formGroup.controls;
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.getApplicationCategories();
    this.getSupportApplicationId();
  }

  back(): void {
    this.location.back();
  }

  onCreateAppeal(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      this.showValidationError();
      return;
    }

    this.createAppeal();
  }

  private createAppeal(): void {
    const formValue = this.formGroup.getRawValue();
    const attachedFiles = formValue.attachedFile;

    this.submitted = true;

    const uploadRequest = attachedFiles && attachedFiles.length > 0
      ? this.supportCenterService.uploadFiles(attachedFiles)
      : of(null);

    uploadRequest
      .pipe(
        switchMap((uploadResponse) => {
          const appealData = { ...formValue };
          delete appealData.attachedFile;

          if (uploadResponse) {
            const responses = Array.isArray(uploadResponse) ? uploadResponse : [uploadResponse];
            appealData.fileIds = responses
              .filter(response => response.data)
              .map(response => response.data.id || response.data);
          }

          return this.supportCenterService.createAppeal(appealData);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: res.message,
          });

          setTimeout(() => {
            this.router.navigate(['/help/detail', res.data.id, 'info']);
          }, 1000);
        } else {
          const toasterMessage = res.errors?.fileIds?.[0]
            ? res.errors.supportApplicationId[0]
            : res.errors?.message;

          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: toasterMessage || res.message,
          });
        }
        this.submitted = false;
      });
  }

  private showValidationError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!'
    });
  }

  private getApplicationCategories(): void {
    this.supportCenterCategoryService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.applicationCategories = res.data || [];
        this.formGroup.updateValueAndValidity();
      })
  }

  private getSupportApplicationId(): void {
    this.supportApplicationId = this.route.snapshot.paramMap.get('id');
  }

  private createFormGroup(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(null, Validators.required),
      supportApplicationCategoryId: new FormControl(null, Validators.required),
      message: new FormControl(''),
      contactPhoneNumber: new FormControl(null, [PhoneValidator.validate(), Validators.required]),
      contactEmail: new FormControl('', [Validators.email, Validators.required]),
      attachedFile: new FormControl(null)
    })
  }
}
