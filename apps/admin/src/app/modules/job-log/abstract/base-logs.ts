import { Directive, signal, viewChild } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { IFilterParams, IPaginate } from "@core/interfaces";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TableComponent } from "@shared/components/table/table.component";
import { IJobLog } from "@modules/job-log/interfaces/job-log.interface";

@Directive()
export abstract class BaseLogsComponent {
  protected loading = signal(false);
  protected jobLogData: IJobLog[];
  protected paginate: IPaginate;
  protected table = viewChild(TableComponent);
  protected abstract get columns(): any;

  protected fetchLogs(serviceMethod: (params: any) => Observable<any>, params: IFilterParams): void {
    this.loading.set(true);

    const requestParams = {
      page: params.page,
      pageSize: params.pageSize,
      filters: params.filters,
      ...(params.sorts ? { sorts: params.sorts } : {})
    };

    serviceMethod(requestParams)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed((this as any).destroyRef)
      )
      .subscribe(res => {
        if (res?.status) {
          this.jobLogData = res.data || [];
          this.paginate = res.meta?.pagination || {};
          this.table().render(this.columns, this.jobLogData);
        }
      });
  }

}
