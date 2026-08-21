import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {catchError, finalize} from 'rxjs/operators';
import { MessageService } from '@core/services';
import { ToastEnum } from '@eskhata/util';
import { QrPosAnalyticsApiService } from '@modules/analytics/services/qr-pos-analytics-api.service';
import {
  IQrPosQuarterPlan,
  IQrPosServerSettings,
} from '@modules/analytics/qr-pos-analytics/interfaces/qr-pos-analytics.interface';
import {EMPTY} from "rxjs";
import { IAnalyticsSettings } from "@modules/analytics/interfaces/qr-pos-analytics.interface";

@Component({
  standalone: true,
  selector: 'em-analytics-settings-dialog',
  templateUrl: './analytics-settings-dialog.component.html',
  styleUrls: ['./analytics-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})

export class AnalyticsSettingsDialogComponent implements OnInit {
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  readonly planHeaders = ['Год', 'Кв.', 'План (TJS)', 'Активн. точек', ''];

  private readonly ref = inject(MatDialogRef<AnalyticsSettingsDialogComponent, IAnalyticsSettings>);
  private readonly api = inject(QrPosAnalyticsApiService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    inactivityDays: this.fb.nonNullable.control(30, [
      Validators.required,
      Validators.min(0),
      Validators.max(365),
    ]),
    plans: this.fb.array<FormGroup>([]),
  });

  get plans(): FormArray<FormGroup> {
    return this.form.controls.plans;
  }

  ngOnInit(): void {
    this.loadFromServer();
  }

  addPlan(): void {
    const last = this.plans.at(this.plans.length - 1)?.value as IQrPosQuarterPlan | undefined;
    let year: number;
    let quarter: number;
    if (!last) {
      year = new Date().getFullYear();
      quarter = 1;
    } else if (last.quarter < 4) {
      year = last.year;
      quarter = last.quarter + 1;
    } else {
      year = last.year + 1;
      quarter = 1;
    }
    this.plans.push(this.buildPlanGroup({ year, quarter, planAmount: 0, activeMerchantsPlan: 0 }));
  }

  removePlan(index: number): void {
    this.plans.removeAt(index);
  }

  cancel(): void {
    this.ref.close();
  }

  save(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: IQrPosServerSettings = {
      inactivityDays: raw.inactivityDays,
      plans: raw.plans as IQrPosQuarterPlan[],
    };

    this.api.updateSettings(payload)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: res => {
          this.messageService.add({ severity: ToastEnum.SUCCESS, summary: res?.message});
          this.ref.close(payload);
        },
        error: err => {
          this.messageService.add({severity: ToastEnum.ERROR, summary: err?.message});
        },
      });
  }

  private buildPlanGroup(plan: IQrPosQuarterPlan): FormGroup {
    return this.fb.group({
      year: this.fb.nonNullable.control(plan.year, [
        Validators.required,
        Validators.min(2000),
        Validators.max(2100),
      ]),
      quarter: this.fb.nonNullable.control(plan.quarter, [
        Validators.required,
        Validators.min(1),
        Validators.max(4),
      ]),
      planAmount: this.fb.nonNullable.control(plan.planAmount, [Validators.min(0)]),
      activeMerchantsPlan: this.fb.nonNullable.control(plan.activeMerchantsPlan, [Validators.min(0)]),
    });
  }

  private loadFromServer(): void {
    this.loading.set(true);

    this.api.getSettings()
      .pipe(
        catchError(() => EMPTY),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        if (!res?.data) return;
        this.form.controls.inactivityDays.setValue(res.data.inactivityDays ?? 30);
        const fromServer = (res.data.plans ?? [])
          .slice()
          .sort((a, b) => a.year - b.year || a.quarter - b.quarter);
        this.plans.clear();
        fromServer.forEach(p => this.plans.push(this.buildPlanGroup(p)));
      });
  }
}
