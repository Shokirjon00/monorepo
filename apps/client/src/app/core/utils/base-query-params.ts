import { ICaption } from '@core/interfaces';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';
import { parseFilterParams } from '@core/utils/filter-util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyRef } from '@angular/core';

type Constructor<T = object> = abstract new (...args: any[]) => T;

export function WithQueryParams<TBase extends Constructor>(Base: TBase) {
  abstract class WithQueryParamsClass extends Base {
    abstract captionKey: string;
    abstract columns: ICaption[];
    abstract getData(parsedParams: unknown): void;

    params: Record<string, any> = {};
    queryParams: Record<string, any> = {
      page: 1,
      pageSize: 15,
      filters: '',
    };

    setQueryParams(params: Record<string, any>): void {
      this.queryParams = { ...this.queryParams, ...params };
    }

    protected initQueryParams(): void {
      const self = this as unknown as {
        route: ActivatedRoute;
        router: Router;
        destroyRef: DestroyRef;
      };

      restoreQueryParamsIfEmpty(this.captionKey, self.route, self.router);

      self.route.queryParams
        .pipe(takeUntilDestroyed(self.destroyRef))
        .subscribe((res: Record<string, unknown>) => {

          this.params = res;

          this.queryParams['page'] = res['page'];
          this.queryParams['pageSize'] = res['pageSize'];

          const parsed = parseFilterParams(res, this.queryParams, this.columns);

          if (this.params['module'] && this.captionKey !== this.params['module']) {
            this.queryParams['page'] = 1;
          } else {
            this.queryParams['module'] = this.captionKey;
          }

          this.getData(parsed);
        });
    }
  }
  return WithQueryParamsClass;
}
