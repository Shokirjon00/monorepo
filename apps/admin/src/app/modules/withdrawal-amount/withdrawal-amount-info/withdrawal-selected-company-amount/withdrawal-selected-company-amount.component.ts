import { Component, inject, OnInit } from '@angular/core';
import { CaptionService } from '@core/services/caption.service';
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@core/interfaces/header.interface';
import { ICompany } from '@modules/client/company/interfaces/company.interface';
import { CompanyService } from '@modules/client/company/services/company.service';
import { finalize, mergeMap, of, takeUntil } from 'rxjs';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IPaginate } from '@eskhata/util';
import { IMerchant } from '@modules/client/merchant/interfaces/merchant.interface';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import {
  WithdrawalAmountService
} from '@modules/withdrawal-amount/withdrawal-amount-info/services/withdrawal-amount.service';
import { Location } from '@angular/common';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { debounceTime, delay } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from "angular-svg-icon";
import { SharedModule } from "@shared/shared.module";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-withdrawal-selected-company-amount',
  templateUrl: './withdrawal-selected-company-amount.component.html',
  styleUrls: ['./withdrawal-selected-company-amount.component.scss'],
  providers: [
    WithdrawalAmountService,
    MerchantService,
    CompanyService
  ],
    imports: [
        SvgIconComponent,
        ReactiveFormsModule,
        SharedModule,
        EbLoaderComponent,
        ToastComponent,
        EmHeaderComponent
    ]
})
export class WithdrawalSelectedCompanyAmountComponent extends DestroyableComponent implements OnInit {
  companies: ICompany[];
  merchants: IMerchant[];
  loading: boolean = false;
  submitted: boolean = false;
  companyId: string;
  pagination: IPaginate;
  paginate: IPaginate;
  selectedCompany: { companyId: string; merchantsId?: string[] }[] = [];
  searchCompanyControl = new FormControl('');
  header: IHeader = {
    title: '',
    isFilter: false,
    tabShow: false,
    paginationHide: true,
  };

  private readonly captionService = inject(CaptionService);
  private readonly store = inject(HeaderService);
  private readonly service = inject(WithdrawalAmountService);
  private readonly companyService = inject(CompanyService);
  private readonly merchantService = inject(MerchantService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly messageService = inject(MessageService);
  private queryParamsCompany: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };
  private queryParamsMerchant: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getCompanyList();
    this.searchCompanyControl.valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(res => {
        if (res) {
          this.queryParamsCompany.page = 1;
          this.queryParamsCompany.filters = `name@=*${res}`;
          this.getCompanyList();
        }
      });
  }

  getCompanyList(scrolled: boolean = false): void {
    this.queryParamsCompany.filters += ',eskhataAcquirer==Да,MerchantsStatus==true';
    this.companyService.getCompanies(this.queryParamsCompany)
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          if (scrolled) {
            this.companies = this.companies.concat(res.data);
          } else {
            this.companies = res.data;
          }
          this.paginate = res.meta.pagination;
        }
      })
  }

  selectedAllMerchant(company: ICompany, event: Event): void {
    company.isSelected = !company.isSelected;
    this.companyId = company.id;
    if (company.isSelected) {
      this.getMerchantsList(true);
    } else {
      this.getMerchantsList();
      this.selectedCompany = this.selectedCompany.filter((item: any) => item.companyId !== this.companyId);
    }
    event.stopPropagation();
  }

  selectCompany(company: ICompany): void {
    this.companyId = company.id;
    this.getMerchantsList();
  }

  selectMerchant(merchant: IMerchant, event: Event): void {
    const checkCompany = this.selectedCompany.find(item => item.companyId === this.companyId);
    const merchantIdCount = this.selectedCompany.find(item => item.companyId === this.companyId)?.merchantsId.length;
    if (!checkCompany) {
      this.selectedCompany.push({companyId: this.companyId, merchantsId: []});
      this.selectedCompany.find(item => item.companyId === this.companyId)?.merchantsId.push(merchant.id);
    } else if (merchantIdCount !== this.merchants.length) {
      if (this.selectedCompany.find(item => item.companyId === this.companyId)?.merchantsId.find(item => item === merchant.id)) {
        this.selectedCompany.find(item => item.companyId === this.companyId).merchantsId = this.selectedCompany.find(item => item.companyId === this.companyId).merchantsId.filter((item: any) => item !== merchant.id);
      } else {
        this.selectedCompany.find(item => item.companyId === this.companyId)?.merchantsId.push(merchant.id);
      }
    } else if (merchantIdCount === this.merchants.length) {
      this.selectedCompany.find(item => item.companyId === this.companyId).merchantsId = this.selectedCompany.find(item => item.companyId === this.companyId).merchantsId.filter((item: any) => item !== merchant.id);
    } else {
      this.selectedCompany = this.selectedCompany.filter((item: any) => item.companyId !== this.companyId);
    }
    if (!this.selectedCompany.find(item => item.companyId === this.companyId).merchantsId.length) {
      this.selectedCompany = this.selectedCompany.filter((item: any) => item.companyId !== this.companyId);
      this.companies.find(item => item.id === this.companyId).isSelected = false;
    } else {
      this.companies.find(item => item.id === this.companyId).isManuallySelected = this.selectedCompany.find(item => item.companyId === this.companyId)?.merchantsId?.length !== this.merchants.length;
      this.companies.find(item => item.id === this.companyId).isSelected = true;
    }
    event.stopPropagation();
  }

  onScrolled(): void {
    this.queryParamsCompany.page += 1;
    this.getCompanyList(true);
  }

  back(): void {
    this.location.back();
  }

  isSelectedCompany(company: ICompany): boolean {
    return !!this.selectedCompany.find(item => item?.companyId === company.id);
  }

  isSelectedMerchant(merchant: IMerchant): boolean {
    return this.selectedCompany.find(item => item?.companyId === this.companyId)?.merchantsId.includes(merchant.id);
  }

  getMerchantsList(selectedAll: boolean = false): void {
    this.loading = true;
    this.queryParamsMerchant.filters = `companyId==${this.companyId},eskhataAcquirer==Да`;
    this.merchantService.getMerchantsWithoutPagination(this.queryParamsMerchant)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.merchants = res.data;
          if (selectedAll) {
            if (!this.selectedCompany.find(item => item?.companyId === this.companyId) && this.merchants.length) {
              this.selectedCompany.push({companyId: this.companyId, merchantsId: []});
              this.merchants.forEach(merchant => {
                this.selectedCompany.find(item => item?.companyId === this.companyId)?.merchantsId.push(merchant.id);
              })
            }
          } else {
            this.companies.find(item => item.id === this.companyId).isManuallySelected = false;
          }
        }
      })
  }

  onSubmit(): void {
    this.submitted = true;
    this.service.manuallyIssueMoney({companies: this.selectedCompany})
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.back();
        }
      })
  }

  clearDate(): void {
    this.searchCompanyControl.setValue('');
    this.queryParamsCompany.filters = '';
    this.getCompanyList();
  }

  private initData(): void {
    this.captionService.setCaption([]);
    this.store.setAction([]);
    this.store.setHeader(this.header);
  }
}
