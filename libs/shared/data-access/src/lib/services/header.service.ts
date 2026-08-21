import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IAction, IHeader, IHeaderBack, IPaginate } from '@eskhata/util';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  public data$ = new BehaviorSubject<IHeader>({} as any);
  public dataBack$ = new Subject<IHeaderBack>();
  public action$ = new BehaviorSubject<IAction[]>([]);
  public page$ = new Subject<IPaginate>();
  public pageChanged$ = new Subject<IPaginate>();
  public merchantId$ = new BehaviorSubject<string>(null);
  public posId$ = new BehaviorSubject<string>(null);
  public dialogAction$ = new BehaviorSubject<string>(null);
  public isIntegrationStatus$ = new BehaviorSubject<boolean>(null);
  public refreshTable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public tableItemIds$ = new Subject<string[]>();
  public clearTableItemIds$ = new BehaviorSubject<boolean>(null);

  setTableItemIds(id: string[]): void {
    this.tableItemIds$.next(id);
  }

  getTableItemIds(): Subject<string[]> {
    return this.tableItemIds$;
  }

  setDialog(value: string): void {
    this.dialogAction$.next(value);
  }

  getDialog(): Subject<string> {
    return this.dialogAction$;
  }

  setHeader(headerData: IHeader): void {
    this.data$.next(headerData);
  }

  getHeader(): Subject<IHeader> {
    return this.data$;
  }

  setHeaderBack(headerBack: IHeaderBack): void {
    this.dataBack$.next(headerBack);
  }

  getHeaderBack(): Subject<IHeaderBack> {
    return this.dataBack$;
  }

  setAction(action: IAction[]): void {
    this.action$.next(action);
  }

  getAction(): BehaviorSubject<IAction[]> {
    return this.action$;
  }

  setPage(page?: IPaginate): void {
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

  setMerchantId(merchantId: string): void {
    this.merchantId$.next(merchantId);
  }

  getMerchantId(): BehaviorSubject<string> {
    return this.merchantId$;
  }

  setPosId(posId: string): void {
    this.posId$.next(posId);
  }

  getPosId(): BehaviorSubject<string> {
    return this.posId$;
  }

  setIntegrationStatus(isIntegrated: boolean): void {
    this.isIntegrationStatus$.next(isIntegrated);
  }

  getIntegrationStatus(): BehaviorSubject<boolean> {
    return this.isIntegrationStatus$;
  }
}
