import { Component, EventEmitter, Output, signal, input, inject, computed, DestroyRef } from '@angular/core';
import { IAction } from '@shared/components/actions/actions.interface';
import { ActionEnum } from '@core/enums/action-enum';
import { ActivatedRoute, Router } from '@angular/router';
import { TableService } from '@shared/components/table/services/table.service';
import { FileSaverService } from 'ngx-filesaver';
import { getSieveOperatorValue, parseFilterParams } from '@core/utils/filter-util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { HeaderService } from '@core/services/header.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { CaptionService } from '@core/services/caption.service';
import { ICaption } from '@core/interfaces/table.interface';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { PaymentsConstants } from "@modules/transactions/payments/payments.constants";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-actions',
  templateUrl: './actions.component.html',
  imports: [
    NgxPermissionsModule,
    AngularSvgIconModule,
    ClickOutsideModule,
    ToastComponent
  ],
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent {
  readonly actionData = input<IAction>();
  readonly disabled = input<boolean>(false);
  readonly columns = input<ICaption[]>([]);
  readonly pathReport = input<string>();
  readonly actionStatus = input<boolean>(true);
  @Output() changeStatus = new EventEmitter();
  @Output() changeDialog = new EventEmitter();
  @Output() withdraw = new EventEmitter();
  @Output() continuePayment = new EventEmitter();
  @Output() unlockPayment = new EventEmitter();
  @Output() syncStatus = new EventEmitter();
  @Output() syncPaymentInfo = new EventEmitter();
  @Output() paymentRefund = new EventEmitter();
  @Output() orderStatus = new EventEmitter();
  @Output() orderWebhook = new EventEmitter<boolean>();
  @Output() issueMoney = new EventEmitter();
  @Output() statusHide = new EventEmitter<void>();
  @Output() refreshTable = new EventEmitter<boolean>();
  @Output() dorDispatch = new EventEmitter<boolean>();
  @Output() generatingApplication = new EventEmitter<boolean>();
  @Output() companyIftSync = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<{ file: File; action: IAction }>();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tableService = inject(TableService);
  private readonly messageService = inject(MessageService);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly headerService = inject(HeaderService);
  private readonly captionService = inject(CaptionService);
  protected readonly destroyRef = inject(DestroyRef);

  readonly action = ActionEnum;
  readonly actions: IAction[] = [...PaymentsConstants.PAYMENTS_ACTIONS];

  showAction = signal<boolean | null>(null);
  isVisible = signal(true);

  captions = signal<ICaption[]>([]);

  queryParams = signal<IFilterParams>({
    sorts: '',
  });

  tooltipText = computed(() =>
    this.isVisible() ? 'Скрыть' : 'Показать'
  );

  constructor() {

    this.captionService.getCaption()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.captions.set(res?.caption ?? []);
      });

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.queryParams.update(prev =>
          parseFilterParams(params, prev, this.columns())
        );
      });
  }

  navigate(actionItem: IAction): void {
    this.router.navigate([actionItem.path], {
      queryParams: actionItem.queryParams
    }).catch();
    this.showAction.set(null);
  }

  refresh(): void {
    this.headerService.refreshTable$.next(true);
    this.refreshTable.emit(true);
  }

  openDialog(dialogName: string): void {
    this.headerService.setDialog(dialogName);
  }

  toggle(): void {
    this.showAction.update(v => !v);
  }

  toggleStatus(): void {
    this.isVisible.update(v => !v);
    this.statusHide.emit();
  }

  getReport(path: string, actionData: IAction): void {
    const params = structuredClone(this.queryParams());

    if (actionData?.mode) {
      const sieveOperator = getSieveOperatorValue(actionData.mode);
      params.filters = params.filters?.replace(/@=\*/, sieveOperator);
    }

    this.tableService.getReport(path, params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const disposition = res.headers.get('content-disposition');

        if (!disposition) {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: 'Не удается скачать файл',
            detail: 'Обратитесь к администратору',
          });
          return;
        }
        const fileName = disposition.split(';')[1].split('=')[1];
        this.fileSaverService.save(res.body, fileName);
      });
  }

  onFileSelected(event: Event, action: IAction): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.fileSelected.emit({ file, action });
    input.value = '';
  }

  getCompanyRegistrationReports(path: string): void {
    this.tableService.getReportCompanyRegistration(path, this.queryParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
          if (res.body instanceof Blob && res.body.size > 0) {
            const disposition = res.headers.get('content-disposition');
            if (!disposition) {
              const reader = new FileReader();
              reader.onload = () => {
                  const jsonResponse = JSON.parse(reader.result as string);
                  if (jsonResponse.message) {
                    this.messageService.add({
                      severity: ToastEnum.SUCCESS,
                      summary: jsonResponse.message
                    });
                  }
              };
              reader.readAsText(res.body);
            }
          }
      });
  }

  queueExport(path: string): void {
    this.tableService.queueExport(path, this.queryParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res =>
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message,
        })
      );
  }

}
