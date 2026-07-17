import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ErrorService } from '@core/services/error.service';
import { filter, switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { AlertDialogComponent } from '@shared/dialogs/alert-dialog/alert-dialog.component';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { driver } from "driver.js";
import { UpdateDialogComponent } from "@shared/dialogs/update-dialog/update-dialog.component";
import { TOUR_STEPS } from "@core/tour-steps";
import { TourStep } from "@core/interfaces/tour-steps";
import { AuthService } from "@modules/auth/service/auth.service";
import { SwUpdate } from "@angular/service-worker";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-root',
  templateUrl: './app.component.html',
  imports: [
    RouterOutlet
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DestroyableComponent implements OnInit, OnDestroy {
  title = 'EskhataAcquringWebAdmin';
  isTourStarted = false;

  private steps: TourStep[] = TOUR_STEPS;
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly permissionService = inject(NgxPermissionsService);
  protected readonly errorService = inject(ErrorService);
  protected readonly dialog = inject(MatDialog);
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly swUpdate = inject(SwUpdate);

  ngOnInit(): void {
    this.setPermissions();
    this.showError();
    this.clearLocalStorage();
    window.addEventListener('load', this.loadStyle.bind(this));
  }

  private listenForVersionUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(upd => {
        switch (upd.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${upd.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${upd.currentVersion.hash}`);
            console.log(`New app version ready for use: ${upd.latestVersion.hash}`);
            this.showUpdateDialog(upd.latestVersion.hash);
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`Failed to install app version '${upd.version.hash}': ${upd.error}`);
            break;
        }
      });
      this.swUpdate
        .checkForUpdate()
        .then(updateFound =>
          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.')
        )
        .catch(error => {
          console.error('Could not check for app updates', error);
        });
    }
  }

  private showUpdateDialog(newVersion?: string): void {
    const dialogRef = this.dialog.open(UpdateDialogComponent, {
      disableClose: false,
      data: {
        version: newVersion,
        features: []
      }
    });
    dialogRef.afterClosed().subscribe(() => {
        localStorage.setItem('shouldStartTour', 'true');
      });
  }

  private startTourIfNeeded(): void {
    const shouldStartTour = localStorage.getItem('shouldStartTour');
    if (shouldStartTour) {
      localStorage.removeItem('shouldStartTour');
      setTimeout(() => {
        this.startTourForNewFeature();
      }, 2000);    }
  }

  private startTourForNewFeature(): void {
    if (!this.authService.isAuthenticated() || this.isTourStarted || !localStorage.getItem('permissions') || this.isAuthPage(this.router.url)) {
      return;
    }

    this.isTourStarted = true;
    this.navigateAndStartTour(0);
  }

  private hasAccessToStep(step: TourStep): any {
    return !step.permission || this.permissionService.hasPermission(step.permission);
  }

  private navigateAndStartTour(stepIndex: number): void {
    while (stepIndex < this.steps.length && !this.hasAccessToStep(this.steps[stepIndex])) {
      stepIndex++;
    }
    if (stepIndex >= this.steps.length) {
      this.isTourStarted = false;
      this.router.navigate(['/analytics']).catch();
      return;
    }
    this.driveElements(stepIndex);
  }

  private driveElements(stepIndex: number): void {
    const step = this.steps[stepIndex];
    this.router.navigate([step.route]).then(() => {
      setTimeout(() => {
        const element = document.querySelector(step.element);
        if (!element) {
          this.navigateAndStartTour(stepIndex + 1);
          return;
        }
        this.initializeDriver(stepIndex, step);
      }, 500);
    });
  }

  private initializeDriver(stepIndex: number, step: TourStep): void {
    const driverObj = driver({
      allowClose: false,
      showButtons: ['next'],
      popoverClass: 'custom-popover',
      steps: [
        {
          element: step.element,
          popover: {
            title: step.title,
            description: step.description,
            side: step.side,
            align: step.align,
            nextBtnText: stepIndex === this.steps.length - 1 ? 'Завершить' : 'Вперед',
            onNextClick: (): void => {
              driverObj.destroy();
              this.router.navigate(['/analytics']).catch();
              this.navigateAndStartTour(stepIndex + 1);
            },
            onCloseClick: (): void => {
              driverObj.destroy();
              this.router.navigate(['/analytics']).catch();
            },
          },
        },
      ],
      onPopoverRender: (popover) => {
        popover.title.classList.add('custom-popover-title');
        popover.description.classList.add('custom-popover-description');
        popover.footer.classList.add('custom-popover-footer');
        popover.nextButton.classList.add('custom-popover-next-btn');
        popover.wrapper.classList.add(`align-${step.align}`);
        popover.wrapper.classList.add(`side-${step.side}`);
      },
    });
    driverObj.drive();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    window.removeEventListener('load', this.loadStyle.bind(this));
  }

  private clearLocalStorage(): void {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(event => {
        const url = event.urlAfterRedirects || event.url;
        if (this.isAuthPage(url)) {
          localStorage.clear();
        }
      });
  }

  private isAuthPage(path: string): boolean {
    return ['/login', '/first-password', '/new-password'].includes(path);
  }

  private loadStyle(): void {
    appendStyle('late-styles.css');
  }

  private setPermissions(): void {
    const permissions = JSON.parse(localStorage.getItem('permissions'));

    if (permissions) {
      this.permissionService.loadPermissions(permissions);
    }
  }

  private showError(): void {
    this.errorService.show$
      .pipe(
        switchMap(({ title, body }) => {
          this.errorService.hasDialog = true;
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = { title, body };
          dialogConfig.maxWidth = '90vw';
          return this.dialog.open(AlertDialogComponent, dialogConfig)
            .afterOpened();
        }),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.errorService.hasDialog = false);
  }

}

function appendStyle(name: string): void {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = name;
  document.head.appendChild(style);
}
