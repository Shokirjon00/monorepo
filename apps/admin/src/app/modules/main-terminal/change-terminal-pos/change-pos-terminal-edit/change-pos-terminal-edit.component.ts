import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, tap } from 'rxjs/operators';
import { delayWhen, timer } from 'rxjs';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxMaskDirective } from 'ngx-mask';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { environment  as env} from '@environments/environment';
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { ValidatorComponent } from '@shared/components/validator/validator.component';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { ChangePosTerminalService } from '../services/change-pos-terminal.service';
import {
  IChangePosTerminalUpdate,
} from '../interfaces/change-pos-terminal.interface';
import {
  DATE_FIELDS,
  INFO_ROWS_CONFIG,
  TERMINAL_STATUSES,
} from '@modules/main-terminal/change-terminal-pos/change-pos-terminal-edit/form-fields.constants';
import { IInfoRow } from '@modules/main-terminal/change-terminal-pos/change-pos-terminal-edit/form-fields.interface';

type DateKey = 'letterDate' | 'offerDate' | 'installationActDate' | 'removalActDate';

@Component({
  standalone: true,
  selector: 'em-change-pos-terminal-edit',
  templateUrl: './change-pos-terminal-edit.component.html',
  styleUrls: ['./change-pos-terminal-edit.component.scss'],
  providers: [ChangePosTerminalService, DatePipe],
  imports: [
    ReactiveFormsModule,
    AutocompleteComponent,
    EmHeaderComponent,
    ValidatorComponent,
    NgxPermissionsModule,
    SvgIconComponent,
    DateTimePipe,
    EbLoaderComponent,
    ToastComponent,
    NgxMaskDirective,
  ],
})
export class ChangePosTerminalEditComponent extends EMBaseForm implements OnInit {
  form!: FormGroup;
  readonly businessManager = `${env.api.responsibleBankEmployee}/${env.api.dictionary}`;
  readonly companySegment = `${env.api.companySegments}/${env.api.dictionary}`;
  readonly terminalModels = `${env.api.terminalModels}/${env.api.dictionary}`;
  readonly dateFields = DATE_FIELDS;

  terminalStatuses = signal(TERMINAL_STATUSES);
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly changePosTerEdit = signal<IChangePosTerminalUpdate | null>(null);
  readonly infoRows = signal<IInfoRow[]>([]);
  readonly currentFormValue = signal<Record<string, unknown>>({});

  readonly hasRequiredFields = computed(() => {
    const current = this.currentFormValue();
    return !!current['terminalStatusId'] && !!current['segmentId'];
  });

  readonly canSubmit = computed(() => this.hasRequiredFields() && !this.submitted());

  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ChangePosTerminalService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);
  private terminalId!: string;

  constructor(location: Location, dialog: MatDialog) {
    super(location, dialog);
  }

  ngOnInit(): void {
    this.terminalId = this.route.snapshot.params['posTerminalId'];
    this.createForm();

    this.form.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => this.currentFormValue.set(value));

    if (this.terminalId) {
      this.loadData(this.terminalId);
    }
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    if (!this.changePosTerEdit()) return;

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Неправильно заполнены данные!',
      });
      return;
    }

    this.submitted.set(true);

    this.service
        .postUpdate(this.buildPayload())
        .pipe(
            tap(res => this.messageService.add({
              severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
              summary: res.message,
            })),
            delayWhen(res => timer(res.status ? 2000 : 0)),
            finalize(() => this.submitted.set(false)),
            takeUntilDestroyed(this.destroyRef),
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

  private createForm(): void {
    this.form = this.fb.group({
      id: [''],
      terminalStatusId: ['', Validators.required],
      segmentId: ['', Validators.required],
      simPos: [''],
      terminalModelId: [''],
      terminalSerialNumber: [''],
      ownerName: [''],
      managerId: [''],
      businessManagerId: [''],
      letterDate: [''],
      offerDate: [''],
      installationActDate: [''],
      removalActDate: [''],
      installationActNumber: [''],
      removalActNumber: [''],
      inventoryNumber: [''],
    });
  }

  private loadData(id: string): void {
    this.loading.set(true);
    this.service
        .getUpdateById(id)
        .pipe(
            finalize(() => this.loading.set(false)),
            takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(res => {
          if (!res.status) return;

          this.dataSource = res.data;
          this.changePosTerEdit.set(res.data);
          this.infoRows.set(this.buildInfoRows(res.data));

          const dates = this.dateFields.reduce<Record<string, string>>(
              (acc, {control}) => {
                acc[control] = this.datePipe.transform(res.data[control as DateKey], DateFormatEnum.YEAR_DATE_TIME_FORMAT) ?? '';
                return acc;
              },
              {},
          );

          this.form.patchValue({...res.data, ...dates});

          this.currentFormValue.set({...this.form.value});

          this.form.markAsPristine();
          this.form.markAsUntouched();
        });
  }

  private buildPayload(): IChangePosTerminalUpdate {
    const value = this.form.value;
    const current = this.changePosTerEdit();

    const normalized = Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, val ?? null])
    ) as unknown as IChangePosTerminalUpdate;

    const dates = this.dateFields.reduce<Pick<IChangePosTerminalUpdate, DateKey>>(
        (acc, {control}) => {
          acc[control as DateKey] = this.datePipe.transform(value[control], DateFormatEnum.YEAR_DATE_TIME_FORMAT) || null;
          return acc;
        },
        {} as Pick<IChangePosTerminalUpdate, DateKey>,
    );

    return {
      ...normalized,
      ...dates,
      id: current?.id ?? value.id ?? null,
    };
  }

  private buildInfoRows(data: IChangePosTerminalUpdate): IInfoRow[] {
    return INFO_ROWS_CONFIG.map(({key, field, isDate}) => ({
      key,
      value: data[field] as string | null | undefined,
      isDate,
    }));
  }
}
