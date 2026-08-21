import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/service/auth.service';
import { switchMap } from 'rxjs/operators';
import { ErrorService } from '@core/services/error.service';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { TokenService } from '@core/services/token.service';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Platform } from "@angular/cdk/platform";
import { MatDrawer, MatDrawerContainer, MatDrawerMode } from "@angular/material/sidenav";
import { SidebarMenuComponent } from "@modules/main/sidebar-menu/sidebar-menu.component";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: 'em-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    MatDrawerContainer,
    MatDrawer,
    SidebarMenuComponent,
    SvgIconComponent,
    RouterOutlet
  ]
})
export class MainComponent extends DestroyableComponent implements OnInit {
  isMenuOpen = true;

  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly errorService = inject(ErrorService);
  private readonly platform = inject(Platform);

  isMobile = this.platform.IOS || this.platform.ANDROID;
  mode: MatDrawerMode = this.isMobile ? 'over' : 'side';
  constructor() {
    super();
    this.isMenuOpen = !this.isMobile;
  }

  ngOnInit(): void {
    this.showEndSessionModal();
  }

  private showEndSessionModal(): void {
    this.authService.endSession$
      .pipe(
        switchMap(() => this.errorService.showAlert({title: 'Время сеанса истекло'})),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.dialog.closeAll();
        this.navigateToLogin();
      });
  }

  private navigateToLogin(): void {
    this.tokenService.clearTokens();
    this.authService.temporaryToken = null;
    this.router.navigate(['/auth']).catch();
  }
}
