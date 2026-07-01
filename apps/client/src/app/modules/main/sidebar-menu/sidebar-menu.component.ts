import {
  Component,
  inject,
  OnInit, output,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@modules/auth/service/auth.service';
import { TokenService } from '@core/services/token.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { UserProfileDialogComponent } from '@shared/dialogs/user-profile-dialog/user-profile-dialog.component';
import {
  UserChangePasswordDialogComponent
} from '@shared/dialogs/user-change-password-dialog/user-change-password-dialog.component';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { environment } from '@environments/environment';
import { IUserInfo, IUserProfile } from '@core/interfaces/user.interface';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { HelperService } from '@core/services/helper.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Platform } from '@angular/cdk/platform';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from '@shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpResponse } from '@angular/common/http';
import { UsersService } from '@modules/user-container/user/services/users.service';
import { NgClass } from '@angular/common';

interface SidebarItem {
  text: string;
  route?: string;
  permissionName?: string | string[];
  hasBadge?: boolean;
  children?: SidebarItem[];
  queryParams?: Record<string, any>;
}

@Component({
  standalone: true,
  selector: 'em-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  imports: [
    FormsModule,
    NgxPermissionsModule,
    ClickOutsideModule,
    AngularSvgIconModule,
    SharedModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    NgClass,
  ],
})
export class SidebarMenuComponent extends DestroyableComponent implements OnInit {
  readonly closed = output();
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private userService = inject(UsersService);
  private tokenService = inject(TokenService);
  private helperService = inject(HelperService);
  private messageService = inject(MessageService);
  private permissionsService = inject(NgxPermissionsService);
  private platform = inject(Platform);
  private bottomSheet = inject(MatBottomSheet);

  isTest = environment.isTest;
  avatarImg: any;
  userInfo: IUserInfo;
  showDropdown: boolean;
  expandedItem: SidebarItem | null = null;
  userProfile: IUserProfile;
  appVersion = environment.appVersion;
  isMobile = this.platform.IOS || this.platform.ANDROID;
  menus: SidebarItem[] = [
    {
      text: 'Аналитика',
      route: 'analytics',
      permissionName: 'Analytic',
    },
    {
      text: 'Платежи',
      route: 'payments',
      permissionName: 'PaymentList',
    },
    {
      text: 'Еда',
      route: 'food',
      permissionName: [
        'FoodVendorOrderList',
        'FoodVendorMenuList',
        'FoodVendorDeliveryTypeList',
        'FoodVendorStatisticsList',
        'FoodVendorStatisticsRevenue',
        'FoodVendorStatisticsClientAnalytics',
      ],
      children: [
        {
          text: 'Статистика',
          route: 'analytics-food',
          permissionName: [
            'FoodVendorStatisticsList',
            'FoodVendorStatisticsRevenue',
            'FoodVendorStatisticsClientAnalytics',
          ],
        },
        // {
        //   text: 'Мой рейтинг',
        //   route: 'rating',
        //   permissionName: 'FoodVendorOrderList',
        // },
        {
          text: 'Оценка и отзывы',
          route: 'order-reviews',
          permissionName: 'FoodVendorOrderList',
        },
        {
          text: 'Заказы',
          route: 'orders',
          permissionName: 'FoodVendorOrderList',
        },
        {
          text: 'Меню',
          route: 'food-menu',
          permissionName: 'FoodVendorMenuList',
        },
        {
          text: 'Способ доставки',
          route: 'delivery',
          permissionName: 'FoodVendorDeliveryTypeList',
        },
        {
          text: 'Настройки уведомлений',
          route: 'notification-settings',
          permissionName: 'FoodVendorNotificationSettingsViaTelegramStatus',
        },
      ],
    },
    {
      text: 'Авансовые выплаты',
      route: 'advance-payments',
      permissionName: 'AdvancePayoutList',
    },
    {
      text: 'История смены',
      route: 'shift-history',
      permissionName: 'ShiftList',
    },
    {
      text: 'Заказы',
      route: 'order',
      permissionName: 'OrderList',
    },
    {
      text: 'Заявки на возврат',
      route: 'payments-refund-applications',
      permissionName: 'PaymentRefundApplicationList',
      hasBadge: false,
    },
    {
      text: 'Торговые точки',
      route: 'merchant',
      permissionName: 'MerchantList',
    },
    {
      text: 'Вывод',
      route: 'withdrawal-amount',
      permissionName: 'IssueMoneyRegistryList',
    },
    {
      text: 'Отчеты',
      route: 'report',
      permissionName: 'ReportDictionary',
    },
    {
      text: 'Пользователи',
      route: 'user',
      permissionName: 'UserList',
    },
    {
      text: 'Помощь',
      route: 'help',
      permissionName: 'SupportApplicationList',
    },
    {
      text: 'Настройки',
      route: 'setting',
      permissionName: 'CompanyIntegrationConfiguration',
    },
  ];
  userRoutes = [
    {
      text: 'Профиль',
      code: 'profile',
      permissionName: 'UserProfile',
    },
    {
      text: 'Сменить пароль',
      code: 'change-password',
      permissionName: 'UserChangePassword',
    },
  ];

  ngOnInit(): void {
    this.getUserProfile();
    this.getUserInfo();
    this.setExpandedItemByRoute(this.router.url);
  }

  toggleExpand(item: SidebarItem): void {
    this.expandedItem = this.expandedItem === item ? null : item;
    if (this.isMobile && !item.children) {
      this.closed.emit();
    }
  }

  closeSidebarIfMobile(): void {
    if (this.isMobile) {
      this.closed.emit();
    }
  }

  selectRoute(menuItem: SidebarItem): void {
    this.expandedItem = null;
    this.closeSidebarIfMobile();
  }

  isActive(menuItem: SidebarItem): boolean {
    const currentUrl = this.router.url.split('?')[0];
    if (menuItem.children?.length) {
      return menuItem.children.some(child => currentUrl.startsWith(`/${menuItem.route}/${child.route}`));
    }
    const pathSegments = currentUrl.split('/');
    const routeSegments = [``, ...(menuItem.route?.split('/') ?? [])];
    return routeSegments.every((seg, i) => seg === pathSegments[i]);
  }

  showLogoutDialog(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        data: {
          title: 'Вы действительно хотите покинуть страницу ?',
          successButtonText: 'Да',
          cancelButtonText: 'Нет',
        },
        panelClass: 'custom-modalbox',
      })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.logout();
        }
      });
  }

  onSelect(code: string): void {
    if (code === 'profile') {
      this.showDropdown = false;
      this.dialog
        .open(UserProfileDialogComponent, {
          disableClose: true,
          data: this.userProfile,
          panelClass: 'mobile-dialog',
        })
        .afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          this.getUserInfo();
          this.getUserProfile();
        });
    }

    if (code === 'change-password') {
      this.showDropdown = false;
      this.dialog
        .open(UserChangePasswordDialogComponent, {
          disableClose: true,
          panelClass: 'mobile-dialog',
        })
        .afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          if (res) {
            this.messageService.add({ severity: ToastEnum.SUCCESS, summary: res });
          }
        });
    }
  }

  openDropdown(): void {
    if (this.isMobile) {
      const routes = this.userRoutes.filter(item => this.permissionsService.getPermission(item.permissionName));
      if (!routes.length) return;
      this.bottomSheet
        .open(BottomSheetComponent, {
          panelClass: 'bottom-sheet',
          data: {
            dataSource: routes,
            labelKey: 'text',
          },
        })
        .afterDismissed()
        .subscribe(option => option && this.onSelect(option.code));
    } else {
      this.showDropdown = !this.showDropdown;
    }
  }

  private setExpandedItemByRoute(currentUrl: string): void {
    for (const item of this.menus) {
      if (item.children) {
        const isActiveChild = item.children.some(child => currentUrl.startsWith(`/${item.route}/${child.route}`));
        if (isActiveChild) {
          this.expandedItem = item;
          break;
        }
      }
    }
  }

  private logout(): void {
    this.authService
      .logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          sessionStorage.clear();
          this.tokenService.clearTokens();
          this.authService.temporaryToken = null;
          this.router.navigate(['/auth']).catch();
        }
      });
  }

  private getUserProfile(): void {
    this.userService
      .getUserProfile()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.userProfile = {
            email: res.data.email,
            fullName: res.data.fullName,
            photoFileId: res.data.photoFileId,
            userName: res.data.userName,
            userId: res.data.userId,
            companyId: res.data.companyId,
            fileStorageUrl: res.meta.fileStorageUrl,
            fileStorageToken: res.meta.fileStorageToken,
          };
          sessionStorage.setItem('companyId', this.userProfile.companyId);
          sessionStorage.setItem('userId', this.userProfile.userId);
          sessionStorage.setItem('userFullName', this.userProfile.fullName);
          if (res.data.photoFileId) {
            this.getUploadAvatar(res.meta.fileStorageUrl, res.data.photoFileId, res.meta.fileStorageToken);
          }
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      });
  }

  private getUserInfo(): void {
    this.userService
      .getUserInfo()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.userInfo = res.data;

          const targetMenu = this.menus?.find(menu => menu.route === 'payments-refund-applications');
          targetMenu.hasBadge = this.userInfo.hasRefundApplication;

          if (res.data.photoFileId) {
            this.getUploadAvatar(res.meta.fileStorageUrl, res.data.photoFileId, res.meta.fileStorageToken);
          }
        }
      });
  }

  private getUploadAvatar(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService
      .getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: HttpResponse<Blob>) => this.createImageFromBlob(res.body));
  }

  private createImageFromBlob(image: Blob): void {
    let reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.avatarImg = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
