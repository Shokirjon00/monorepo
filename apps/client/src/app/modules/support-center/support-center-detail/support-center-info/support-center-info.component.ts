import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { ToastEnum } from '@eskhata/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from '@core/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorModule } from '@shared/components/validator/validator.module';
import { provideNgxMask } from 'ngx-mask';
import { UploadFieldComponent } from '@shared/components/upload-field/upload-field.component';
import { SupportCenterCategoryService } from '@modules/support-center/services/support-center-category.service';
import { SupportCenterService } from '@modules/support-center';
import { ISupportCenter } from '@core/interfaces';
import { MessageCardComponent } from '@shared/components/message-card/message-card.component';
import { SharedModule } from '@shared/shared.module';
import { of, switchMap } from 'rxjs';
import { ToastModule } from '@shared/components/toast/toast.module';
import { MatDialog } from '@angular/material/dialog';
import { IRatingDialog } from '@shared/dialogs/rating-dialog/interfaces/rating-dialog.interface';
import { RatingDialogComponent } from '@shared/dialogs/rating-dialog/rating-dialog.component';
import { ISupportCenterRating } from '@modules/support-center/interfaces/support-center-rating.interface';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from 'ngx-permissions';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'em-support-center-info',
  templateUrl: './support-center-info.component.html',
  styleUrls: ['./support-center-info.component.scss'],
  imports: [
    EmHeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorModule,
    UploadFieldComponent,
    MessageCardComponent,
    SharedModule,
    ToastModule,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
  ],
  providers: [
    SupportCenterCategoryService,
    SupportCenterService,
    provideNgxMask()
  ]
})

export class SupportCenterInfoComponent implements OnInit {
  formGroup: FormGroup;
  submitted = false;
  currentSupportCenter: ISupportCenter;
  fileStorageUrl: string;
  fileStorageToken: string;
  fileIds: string[] = [];

  loading = signal(false);

  private supportApplicationId: string;
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly supportCenterService = inject(SupportCenterService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.createFormGroup();
    this.loadSupportCenterData();
  }

  back(): void {
    this.router.navigate(['help/all']).catch();
  }

  onCancelAppeal(): void {
    if (!this.currentSupportCenter || this.submitted) {
      return;
    }

    const dialogData = new ConfirmDialogModel(
      'Вы действительно хотите отменить обращение?',
      this.supportApplicationId,
      undefined,
      false,
      'Нет',
      'Да'
    );

    this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      panelClass: 'custom-modalbox',
      width: '400px',
      disableClose: false
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.cancelAppeal();
        }
      });
  }

  onRate(): void {
    if (!this.currentSupportCenter?.isCompleted || this.submitted) {
      return;
    }

    const dialogData: IRatingDialog = {
      title: 'Обратная связь',
      currentRating: this.currentSupportCenter.rating || 0,
      maxRating: 5,
      allowComment: true
    };

    this.dialog.open(RatingDialogComponent, {
      data: dialogData,
      panelClass: 'rating-dialog-panel',
      width: '500px',
      disableClose: false
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.submitRating(result);
        }
      });
  }

  onSendMessage(): void {
    const formValue = this.formGroup.getRawValue();
    const message: string = formValue.message?.trim();
    const attachedFile = formValue.attachedFile;

    this.submitted = true;
    const uploadRequest = attachedFile && attachedFile.length > 0
      ? this.supportCenterService.uploadFiles(attachedFile)
      : of(null);

    uploadRequest
      .pipe(
        switchMap((uploadResponse) => {
          const messageData = {
            message,
            supportApplicationId: this.supportApplicationId
          } as any;

          if (uploadResponse) {
            const responses = Array.isArray(uploadResponse) ? uploadResponse : [uploadResponse];
            messageData.fileIds = responses
              .filter(response => response.data)
              .map(response => response.data.id || response.data);
          }

          return this.supportCenterService.sendMessage(messageData);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res?.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: res.message,
          });
          this.formGroup.reset();
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
        this.loadSupportCenterData();
      });
  }

  private submitRating(ratingData: any): void {
    this.submitted = true;

    const ratingPayload: ISupportCenterRating = {
      supportApplicationId: this.supportApplicationId,
      rating: ratingData.rating,
      ratingComment: ratingData.ratingComment || null
    };

    this.supportCenterService.submitRating(ratingPayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.submitted = false;

        if (res?.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: res.message,
          });
          this.loadSupportCenterData();
        } else {
          const toasterMessage = res.errors?.supportApplicationId?.[0]
            ? res.errors.supportApplicationId[0]
            : res.errors?.ratingComment?.[0]
              ? res.errors.ratingComment[0]
              : res.errors?.message;
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: toasterMessage || res.message,
          });
        }
      });
  }

  private cancelAppeal(): void {
    this.submitted = true;

    this.supportCenterService.cancelAppeal(this.supportApplicationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.submitted = false;

        if (res?.status) {
          this.loadSupportCenterData();
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: res.message,
          });
        } else {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: res.errors.id[0],
          });
        }
      });
  }

  private loadSupportCenterData(): void {
    this.supportApplicationId = this.activatedRoute.snapshot.parent.paramMap.get('id');

    this.loading.set(true);

    this.supportCenterService.getSupportCenterById(this.supportApplicationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.status) {
          const { data, meta } = res;
          const { fileStorageToken, fileStorageUrl } = meta;

          this.currentSupportCenter = data;
          this.fileStorageToken = fileStorageToken;
          this.fileStorageUrl = fileStorageUrl;
          this.fileIds = data.supportApplicationMessages
            .filter(message => message.fileIds)
            .flatMap(message => message.fileIds);
          this.formGroup.patchValue(data);
        } else {
          const { errors } = res;
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: errors.message
          });
        }

        this.loading.set(false);
      });
  }

  private createFormGroup(): void {
    this.formGroup = new FormGroup({
      message: new FormControl(''),
      attachedFile: new FormControl(null)
    })
  }
}
