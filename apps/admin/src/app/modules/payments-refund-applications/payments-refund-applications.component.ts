import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { IPaymentRefundApplications } from "@core/interfaces/payments-refund-applications.interface";
import {
  PaymentsRefundApplicationsConstants
} from "@modules/payments-refund-applications/payments-refund-applications.constants";
import { IPaginate, ToastEnum } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { IFilterParams } from '@eskhata/util';
import { RefundPaymentApplicationService } from "@core/services/payments-refund-applications.services";
import { finalize, of } from "rxjs";
import { isEmptyObject } from "@core/utils/is-empty-object";
import { setDefaultFilterValue } from '@eskhata/util';
import { parseFilterParams } from "@core/utils/filter-util";
import { MessageService } from '@eskhata/data-access';
import { MatDialog } from "@angular/material/dialog";
import { ICaption, IRowAction } from '@eskhata/util';
import { DomSanitizer } from "@angular/platform-browser";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { delay, mergeMap } from "rxjs/operators";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-payments-refund-applications',
  templateUrl: './payments-refund-applications.component.html',
  providers: [RefundPaymentApplicationService],
  imports: [
    TableComponent,
    ToastComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent
  ],
  styleUrls: ['./payments-refund-applications.component.scss']
})
export class PaymentsRefundApplicationsComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  applications: IPaymentRefundApplications[];
  columns = PaymentsRefundApplicationsConstants.PAYMENTS_REFUND_APPLICATIONS_COLUMNS
  tableActions: IRowAction[] = PaymentsRefundApplicationsConstants.TABLE_ACTIONS
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'payment-refund-applications-cols'

  private queryParams: IFilterParams | any = {page: 1};

  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(RefundPaymentApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.applications);
  }

  paymentUpdate(value: { itemId: string; defaultValue: boolean }): void {
    let id = value.itemId;
    const payment = this.applications.find(i => i.id === id);

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: this.sanitizer.bypassSecurityTrustHtml(
          value.defaultValue
            ? `Вы действительно хотите одобрить возврат?<br>Сумма <span style="font-weight: 700">${payment.amount}</span> будет возвращена покупателю.`
            : `Вы действительно хотите отклонить <br> заявку на возврат?`),
        showInput: !value.defaultValue,
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '90vw'
    })
      .afterClosed()
      .subscribe(res => res && this.onSubmit(id, value.defaultValue, res));
  }

  navigate(dataDetail: { dataSourceId: string, fieldName: string, value: string }): void {
    if (dataDetail.fieldName === 'paymentId') {
      this.router.navigate(['transactions/payments', dataDetail.value, "payment-info"]).catch();
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getApplication()
  }

  private onSubmit(id: string, confirm: boolean, reason: string): void {
    this.loading.set(true);

    this.service.confirm({ id, isConfirm: confirm, description: reason })
      .pipe(
        mergeMap(res => {
          const messages: { severity: ToastEnum; summary: string }[] = [];

          if (!res.status) {
            if (res.errors) {
              Object.values(res.errors as Record<string, string[]>)
                .forEach(errArr => {
                  for (const err of errArr) {
                    messages.push({
                      severity: ToastEnum.ERROR,
                      summary: err
                    });
                  }
                });
            } else {
              messages.push({
                severity: ToastEnum.ERROR,
                summary: res.message || 'Произошла ошибка'
              });
            }
          } else {
            messages.push({
              severity: ToastEnum.SUCCESS,
              summary: res.message
            });
          }

          this.messageService.addAll(messages);
          this.getApplication();

          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  private getApplication(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getAll(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        if (res.status) {
          this.applications = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef),)
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getApplication(params);
        }
      });
  }
}
