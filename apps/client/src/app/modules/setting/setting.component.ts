import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '@eskhata/data-access';
import { DestroyableComponent } from '@eskhata/util';
import { EskhataBankLoaderComponent, ToastModule, ValidatorModule } from '@eskhata/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { SettingService } from '@modules/setting/service/setting.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToastEnum } from '@eskhata/util';
import { NgxPermissionsModule } from 'ngx-permissions';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  standalone: true,
  selector: 'em-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  imports: [
    ReactiveFormsModule,
    ValidatorModule,
    EskhataBankLoaderComponent,
    ToastModule,
    SvgIconComponent,
    NgxPermissionsModule
],
  providers: [SettingService]
})
export class SettingComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  loading: boolean;
  submitted: boolean = false;
  isOpen: boolean = false;

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly settingService = inject(SettingService);
  private readonly clipboardService = inject(ClipboardService);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
    this.getSetting();
  }

  getSetting(): void {
    this.submitted = true;
    this.settingService.getCompanyIntegration()
      .pipe(
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.data) {
          this.form.patchValue(res.data);
        }
      })
  }

  onSubmit(): void {
    this.submitted = true;
    this.settingService.updateCompanyIntegration(this.form.value)
      .pipe(
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message});
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          setValidationErrors(this.form, res);
        }
      });
  }

  copyHashKey(): void {
    this.clipboardService.copy(this.form.controls['companyId'].value);
    this.messageService.add({severity: ToastEnum.SUCCESS, summary: 'Идентификатор организации скопирован!'});
  }

  private createForm(): void {
    this.form = this.fb.group({
      companyId: ['', Validators.required],
      webhookUrl: ''
    })
  }
}
