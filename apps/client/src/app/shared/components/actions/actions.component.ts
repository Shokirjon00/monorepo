import { AfterViewInit, Component, input, inject, output } from '@angular/core';
import { IAction } from '@shared/components/actions/action.interface';
import { ActionEnum } from '@core/enums/action-enum';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { TableService } from '@shared/components/table/services/table.service';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { FileSaverService } from 'ngx-filesaver';
import { parseFilterParams } from '@core/utils/filter-util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { HeaderService } from '@core/services/header.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { ICaption } from '@core/interfaces/table.interface';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ToastModule } from '@shared/components/toast/toast.module';

@Component({
  standalone: true,
  selector: 'em-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  imports: [AngularSvgIconModule, ClickOutsideModule, NgxPermissionsModule, ToastModule],
})
export class ActionsComponent extends DestroyableComponent implements AfterViewInit {
  readonly actionData = input<IAction>();
  readonly columns = input<ICaption[]>([]);
  readonly changeStatus = output<void>();
  readonly changeDialog = output<void>();
  readonly withdrawalMoney = output<void>();
  readonly  refreshTable = output<boolean>();
  submitted: boolean;
  action = ActionEnum;
  showAction: boolean;


  private router = inject(Router);
  private service = inject(TableService);
  private fileSaverService = inject(FileSaverService);
  private headerService = inject(HeaderService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15,
  };

  ngAfterViewInit(): void {
    this.getQueryParams();
  }

  navigate(actionItem: IAction): void {
    this.router.navigate([actionItem.path]).catch();
    this.showAction = null;
  }

  openDialog(dialogName: string): void {
    this.headerService.dialogAction$.next(dialogName);
  }

  toggle(): void {
    this.showAction = !this.showAction;
  }

  refresh(): void {
    this.headerService.refreshTable$.next(true);
    this.refreshTable.emit(true);
  }

  getReport(path: string): void {
    const actionData = this.actionData();
    if (actionData.filterItem) {
      this.queryParams.filters = actionData.filterItem;
    }

    this.service
      .getReport(path, this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          const contentDisposition = res.headers.get('content-disposition');
          const blob = res.body;

          if (contentDisposition && blob) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            const fileName = match ? match[1].replace(/['"]/g, '') : 'report';

            this.fileSaverService.save(blob, fileName);
          } else {
            this.showDownloadError();
          }
        },
        error: () => {
          this.showDownloadError();
        },
      });
  }

  private showDownloadError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Не удается скачать файл',
      detail: 'Обратитесь к администратору',
    });
  }

  private getQueryParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      this.queryParams = parseFilterParams(res, this.queryParams, this.columns());
    });
  }
}
