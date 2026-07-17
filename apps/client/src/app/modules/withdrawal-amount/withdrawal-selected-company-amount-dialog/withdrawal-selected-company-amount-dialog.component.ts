import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHeader } from '@core/interfaces/header.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate, ToastEnum } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { CaptionService } from '@core/services/caption.service';
import { WithdrawalAmountService } from '@modules/withdrawal-amount/withdrawal-amount-info/services/withdrawal-amount.service';
import { MessageService } from '@core/services/message.service';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ToastComponent } from '@shared/components/toast/toast.component';

interface ISubmissionResult {
  id: string;
  name: string;
  status: boolean;
}

@Component({
  standalone: true,
  selector: 'em-withdrawal-selected-company-amount-dialog',
  templateUrl: './withdrawal-selected-company-amount-dialog.component.html',
  styleUrls: ['./withdrawal-selected-company-amount-dialog.component.scss'],
  providers: [WithdrawalAmountService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    SharedModule,
    EskhataBankLoaderComponent,
    ToastComponent,
    MatDialogClose,
  ],
})
export class WithdrawalSelectedCompanyAmountDialogComponent implements OnInit {
  merchants = signal<any[]>([]);
  selectedMerchants = signal<string[]>([]);
  searchLoading = signal(false);
  scrollLoading = signal(false);
  loadingSubmit = signal(false);
  submitted = signal(false);

  submissionResults = signal<ISubmissionResult[]>([]);

  pagination?: IPaginate;
  queryParams: IFilterParams = {
    filters: '',
    page: 1,
    pageSize: 15,
  };
  searchMerchantControl = new FormControl('');

  private readonly destroyRef = inject(DestroyRef);
  private readonly captionService = inject(CaptionService);
  private readonly headerService = inject(HeaderService);
  private readonly withdrawalService = inject(WithdrawalAmountService);
  private readonly messageService = inject(MessageService);

  private readonly header: IHeader = {
    title: 'Выбор торговых точек',
    isFilter: false,
    tabShow: false,
    paginationHide: true,
  };

  get hasErrors(): boolean {
    return this.submissionResults().some(result => !result.status);
  }

  ngOnInit(): void {
    this.initHeader();
    this.loadMerchants();
    this.search();
  }

  clearSearch(): void {
    this.searchMerchantControl.setValue('');
    this.queryParams = { ...this.queryParams, filters: '', page: 1 };
    this.loadMerchants();
  }

  onScrolled(): void {
    if (this.scrollLoading() || !this.pagination) return;
    if (this.queryParams.page >= this.pagination.totalPages) return;
    this.queryParams.page++;
    this.loadMerchants({ isScrolled: true });
  }

  toggleMerchantSelection(merchantId: string): void {
    const selected = this.selectedMerchants();
    if (selected.includes(merchantId)) {
      this.selectedMerchants.set(selected.filter(id => id !== merchantId));
    } else {
      this.selectedMerchants.set([...selected, merchantId]);
    }
  }

  isSelected(merchantId: string): boolean {
    return this.selectedMerchants().includes(merchantId);
  }

  submit(): void {
    if (!this.selectedMerchants().length) return;

    this.loadingSubmit.set(true);

    this.withdrawalService
      .withdrawalAmountNow({ merchantsId: this.selectedMerchants() })
      .pipe(
        finalize(() => this.loadingSubmit.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message,
        });

        if (res.status && Array.isArray(res.data)) {
          const merchantMap = new Map(this.merchants().map(m => [m.id, m.name]));

          const results: ISubmissionResult[] = res.data.map((item: any) => ({
            id: item.id,
            name: merchantMap.get(item.id),
            status: !!item.status,
          }));

          this.submissionResults.set(results);
          this.submitted.set(true);
        }
      });
  }

  private search(): void {
    this.searchMerchantControl.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.onSearch(value));
  }

  private onSearch(value: string | null): void {
    this.queryParams.page = 1;
    this.queryParams.filters = value ? `merchantName@=*${value}` : '';
    this.loadMerchants({ isSearch: true });
  }

  private loadMerchants(options: { isScrolled?: boolean; isSearch?: boolean } = {}): void {
    const { isScrolled = false, isSearch = false } = options;
    if (this.searchLoading() || this.scrollLoading()) return;

    const loadingSignal = isSearch ? this.searchLoading : isScrolled ? this.scrollLoading : this.searchLoading;
    loadingSignal.set(true);

    this.withdrawalService
      .getWithdrawalAmountsMerchants(this.queryParams)
      .pipe(
        finalize(() => loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (!res.status) {
          if (!isScrolled) this.merchants.set([]);
          return;
        }

        const list = res.data || [];
        this.merchants.set(isScrolled ? [...this.merchants(), ...list] : list);
        this.pagination = res.meta?.pagination;
      });
  }

  private initHeader(): void {
    this.captionService.setCaption([]);
    this.headerService.setAction([]);
    this.headerService.setHeader(this.header);
  }
}
