import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IHeader } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IPaymentStatusAmount, ITransaction } from "@modules/transactions/payments/interfaces";


@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  public page$ = new Subject<IPaginate>();
  public pageChanged$ = new Subject<IPaginate>();
  public data$ = new BehaviorSubject<IHeader>({} as any);
  public action$ = new BehaviorSubject<IAction[]>([]);
  public companyId$ = new BehaviorSubject<string>(null);
  public merchantId$ = new BehaviorSubject<string>(null);
  public posId$ = new BehaviorSubject<string>(null);
  public status$ = new BehaviorSubject<IPaymentStatusAmount[]>({} as any);
  public tableItemIds$ = new Subject<string[]>();
  public dialogAction$ = new BehaviorSubject<string>(null);
  public isBankAcquirer$ = new BehaviorSubject<boolean>(null);
  public clearTableItemIds$ = new BehaviorSubject<boolean>(null);
  public headerDataSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public refreshTable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public headerData$: Observable<any> = this.headerDataSubject$.asObservable();

  setPayments(payments: IHttpResponse<ITransaction> | any): void {
    this.headerDataSubject$.next(payments);
  }

  setDialog(value: string): void {
    this.dialogAction$.next(value);
  }

  getDialog(): Subject<string> {
    return this.dialogAction$;
  }

  setPaymentStatic(data: IPaymentStatusAmount[]): void {
    this.status$.next(data);
  }

  getPaymentStatic(): Subject<IPaymentStatusAmount[]> {
    return this.status$;
  }

  setHeader(headerData: IHeader): void {
    this.data$.next(headerData);
  }

  getHeader(): Subject<IHeader> {
    return this.data$;
  }

  setAction(action: IAction[]): void {
    this.action$.next(action);
  }

  getAction(): BehaviorSubject<IAction[]> {
    return this.action$;
  }

  setPage(page: IPaginate): void {
    this.page$.next(page);
  }

  getPage(): Subject<IPaginate> {
    return this.page$;
  }

  setPageChange(pageChange: IPaginate): void {
    this.pageChanged$.next(pageChange);
  }

  getPageChange(): Subject<IPaginate> {
    return this.pageChanged$;
  }

  setCompanyId(companyId: string): void {
    this.companyId$.next(companyId)
  }

  getCompanyId(): BehaviorSubject<string> {
    return this.companyId$;
  }

  setMerchantId(merchantId: string): void {
    this.merchantId$.next(merchantId)
  }

  getMerchantId(): BehaviorSubject<string> {
    return this.merchantId$;
  }

  setTableItemIds(id: string[]): void {
    this.tableItemIds$.next(id)
  }

  getTableItemIds(): Subject<string[]> {
    return this.tableItemIds$;
  }

  setPosId(posId: string): void {
    this.posId$.next(posId)
  }

  getPosId(): BehaviorSubject<string> {
    return this.posId$;
  }

  setBankAcquirer(isBankAcquirer: boolean): void {
    this.isBankAcquirer$.next(isBankAcquirer)
  }

  getBankAcquirer(): BehaviorSubject<boolean> {
    return this.isBankAcquirer$;
  }

  loadClientHeader(): void {
    this.data$.next({
      tabs: [
        {
          label: 'Организации',
          path: 'company',
          permissionName: 'CompanyList'
        },
        {
          label: 'Торговые точки',
          path: 'merchant',
          permissionName: 'MerchantList'
        },
        {
          label: 'Кассы',
          path: 'poses',
          permissionName: 'PosList'
        },
      ],
      isFilter: true,
      tabShow: true
    });
  }

  loadMerchantHeader(data: IHeader): void {
    this.data$.next(data);
  }

  loadPosHeader(data: IHeader): void {
    this.data$.next(data);
  }
}
