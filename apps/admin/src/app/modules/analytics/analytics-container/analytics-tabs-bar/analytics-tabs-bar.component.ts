import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { ITab } from '@core/interfaces/header.interface';
import { TabMenuComponent } from '@shared/components/tab-view/tab-menu.component';
import { AnalyticsSettingsDialogComponent } from '@shared/dialogs/analytics-settings-dialog/analytics-settings-dialog.component';
import { IAnalyticsSettings } from '@modules/analytics/interfaces/qr-pos-analytics.interface';

@Component({
  standalone: true,
  selector: 'em-analytics-tabs-bar',
  templateUrl: './analytics-tabs-bar.component.html',
  styleUrls: ['./analytics-tabs-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DateTimePipe],
  imports: [CommonModule, TabMenuComponent],
})
export class AnalyticsTabsBarComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dateTimePipe = inject(DateTimePipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs = input<ITab[]>([]);
  readonly showStatus = input<boolean>(false);
  readonly settingsChange = output<IAnalyticsSettings>();

  readonly statusOk = signal<boolean>(true);
  readonly updatedAt = signal<string>(this.formatNow());

  refresh(): void {
    window.location.reload();
  }

  openSettings(): void {
    this.dialog
      .open<AnalyticsSettingsDialogComponent, void, IAnalyticsSettings>(
        AnalyticsSettingsDialogComponent,
        { panelClass: 'analytics-settings-dialog', autoFocus: false },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) this.settingsChange.emit(result);
      });
  }

  private formatNow(): string {
    return this.dateTimePipe.transform(new Date().toISOString());
  }
}
