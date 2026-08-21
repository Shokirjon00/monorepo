import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SvgIconComponent } from 'angular-svg-icon';
import { BreadcrumbsComponent } from '@eskhata/ui';
import { DateTimePipe } from '@eskhata/util';
import {
  IChangePosTerminalInfo,
  IInfoRow
} from '@modules/main-terminal/change-terminal-pos/interfaces/change-pos-terminal.interface';
import { ChangePosTerminalService } from '@modules/main-terminal/change-terminal-pos/services/change-pos-terminal.service';
import { INFO_ROWS_CONFIG } from './change-pos-terminal-info.constants';

@Component({
  standalone: true,
  selector: 'em-shifts-info',
  templateUrl: './change-pos-terminal-info.component.html',
  styleUrls: ['./change-pos-terminal-info.component.scss'],
  imports: [
    BreadcrumbsComponent,
    SvgIconComponent,
    NgxPermissionsModule,
    DateTimePipe,
  ],
  providers: [ChangePosTerminalService],
})
export class ChangePosTerminalInfoComponent implements OnInit {
  readonly posTerminal = signal<IChangePosTerminalInfo | null>(null);
  readonly infoRows = signal<IInfoRow[]>([]);
  private readonly posTerminalId: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ChangePosTerminalService);

  constructor() {
    this.posTerminalId = this.route.snapshot.params['posTerminalId'];
  }

  ngOnInit(): void {
    this.getDetail();
  }

  navigateToInfo(): void {
    this.router.navigate(['/main-terminal/pos-list', this.posTerminalId, 'edit']).catch();
  }

  private getDetail(): void {
    this.service
      .getTerminalById(this.posTerminalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (!res.status) return;
        this.posTerminal.set(res.data);
        this.infoRows.set(this.buildInfoRows(res.data));
      });
  }

  private buildInfoRows(data: IChangePosTerminalInfo): IInfoRow[] {
    return INFO_ROWS_CONFIG.map(({ key, field, isDate }) => ({
      key,
      value: data[field] as string | null | undefined,
      isDate,
    }));
  }
}
