import { Component, EventEmitter, Input, Output, signal, input, inject, computed, DestroyRef } from '@angular/core';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { TableService } from '../table/services/table.service';
import { ToastComponent } from '../toast/toast.component';
import { FileSaverService } from 'ngx-filesaver';

import { IFilterParams } from '@eskhata/util';

import { ToastEnum } from '@eskhata/util';
import { FILTER_PARAMS_PARSER, HeaderService, MessageService, SIEVE_OPERATOR_RESOLVER } from '@eskhata/data-access';

import { ICaption } from '@eskhata/util';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@eskhata/util';

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
  @Input() submitted: boolean;
  @Output() changeStatus = new EventEmitter();
  @Output() changeDialog = new EventEmitter();
  @Output() withdrawalMoney = new EventEmitter();
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
  private readonly parseFilterParams = inject(FILTER_PARAMS_PARSER);
  private readonly getSieveOperatorValue = inject(SIEVE_OPERATOR_RESOLVER);
  protected readonly destroyRef = inject(DestroyRef);

  readonly action = ActionEnum;

  showAction = signal<boolean | null>(null);
  isVisible = signal(true);

  queryParams = signal<IFilterParams>({
    sorts: '',
  });

  tooltipText = computed(() =>
    this.isVisible() ? 'Скрыть' : 'Показать'
  );

  constructor() {

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.queryParams.update(prev =>
          this.parseFilterParams(params, prev, this.columns())
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
      const sieveOperator = this.getSieveOperatorValue(actionData.mode);
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
