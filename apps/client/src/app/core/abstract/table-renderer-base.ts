import { ICaption } from '@eskhata/util';
import { TableComponent } from '@eskhata/ui';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyRef } from '@angular/core';

export abstract class TableRendererBase {
  constructor(
    route: ActivatedRoute,
    router: Router,
    destroyRef: DestroyRef
  ) {}

  protected renderTable(
    table: TableComponent,
    columns: (string | ICaption)[],
    dataSource: any[]
  ): void {
    const formattedColumns: ICaption[] = columns.map((col, index) => {
      if (typeof col === 'string') {
        return { key: col, index, isSelected: true } as ICaption;
      }
      return { ...col, index };
    });

    table.render(formattedColumns, dataSource);
  }
}
