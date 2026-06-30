import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Location } from '@angular/common'
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { SettingService } from "@modules/setting-container/setting/services/setting.service";
import { DynamicFieldsComponent } from "@shared/components/dynamic-fields/dynamic-fields.component";
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import {
  ISettingComponents
} from "@modules/setting-container/setting/setting-components/interface/setting-components";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IComponent } from "@modules/setting-container/setting/interfaces/components";

@Component({
  standalone: true,
  selector: 'em-setting-components',
  templateUrl: './setting-components.component.html',
  styleUrls: ['./setting-components.component.scss'],
  providers: [SettingService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ToastComponent,
    EmHeaderComponent,
    DynamicFieldsComponent
  ]
})
export class SettingComponentsComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  setting: IComponent[];
  submitted = signal(false);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly settingId = this.activatedRoute.snapshot.params['id'];
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(SettingService);
  private readonly location = inject(Location);
  protected readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.creatForm();
    this.getSettingComponent();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.isFormInvalid()) return;

    this.submitted.set(true);
    const body = {
      settingId: this.settingId,
      updateSettingComponents: this.buildUpdatePayload()
    };

    this.service.updateSettingComponents(body)
      .pipe(
        mergeMap(res => this.handleResponse(res)),
        finalize(() => this.submitted.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.afterSubmit(res));
  }

  back(): void {
    this.location.back();
  }

  private isFormInvalid(): boolean {
    if (this.form.invalid) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Неправильно заполнены данные!'
      });
      return true;
    }
    return false;
  }

  private buildUpdatePayload(): ISettingComponents[] {
    return this.setting.map((field: ISettingComponents) => ({
      id: field.id,
      label: this.form.get(field.id.toString())?.value
    }));
  }

  private handleResponse(res: ISettingComponents): Observable<ISettingComponents> {
    this.messageService.add({
      severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
      summary: res.message
    });
    return of(res).pipe(delay(res.status ? 2000 : 0));
  }

  private afterSubmit(res: ISettingComponents): void {
    if (res.status) {
      this.form.reset();
      this.back();
    } else {
      setValidationErrors(this.form, res);
    }
  }

  private creatForm(): void {
    this.form = this.fb.group({});
  }

  private getSettingComponent(): void {
    this.service.getSettingComponent(this.settingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.setting = res.data;
        const labelControls = this.setting.reduce((acc: any, field: any) => {
          acc[field.id] = [field.label ?? '', Validators.required];
          return acc;
        }, {} as Record<string, any[]>);

        this.form = this.fb.group(labelControls);
      });
  }
}
