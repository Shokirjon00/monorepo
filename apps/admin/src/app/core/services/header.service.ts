import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IHeader } from '@eskhata/util';
import { HeaderService as SharedHeaderService } from '@eskhata/data-access';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IPaymentStatusAmount, ITransaction } from '@modules/transactions/payments/interfaces';

@Injectable({
  providedIn: 'root',
})
export class HeaderService extends SharedHeaderService {
  public companyId$ = new BehaviorSubject<string>(null);
  public status$ = new BehaviorSubject<IPaymentStatusAmount[]>({} as any);
  public isBankAcquirer$ = new BehaviorSubject<boolean>(null);
  public headerDataSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public headerData$: Observable<any> = this.headerDataSubject$.asObservable();

  setPayments(payments: IHttpResponse<ITransaction> | any): void {
    this.headerDataSubject$.next(payments);
  }

  setPaymentStatic(data: IPaymentStatusAmount[]): void {
    this.status$.next(data);
  }

  getPaymentStatic(): Subject<IPaymentStatusAmount[]> {
    return this.status$;
  }

  setCompanyId(companyId: string): void {
    this.companyId$.next(companyId);
  }

  getCompanyId(): BehaviorSubject<string> {
    return this.companyId$;
  }

  setBankAcquirer(isBankAcquirer: boolean): void {
    this.isBankAcquirer$.next(isBankAcquirer);
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
          permissionName: 'CompanyList',
        },
        {
          label: 'Торговые точки',
          path: 'merchant',
          permissionName: 'MerchantList',
        },
        {
          label: 'Кассы',
          path: 'poses',
          permissionName: 'PosList',
        },
      ],
      isFilter: true,
      tabShow: true,
    });
  }

  loadMerchantHeader(data: IHeader): void {
    this.data$.next(data);
  }

  loadPosHeader(data: IHeader): void {
    this.data$.next(data);
  }
}
