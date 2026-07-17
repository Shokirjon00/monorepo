import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { environment } from '@environments/environment';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { AuthService } from '@modules/auth/service/auth.service';
import { takeUntil } from 'rxjs';
import { TokenService } from '@core/services/token.service';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileDialogComponent } from '@shared/dialogs/user-profile-dialog/user-profile-dialog.component';
import {
  UserChangePasswordDialogComponent
} from '@shared/dialogs/user-change-password-dialog/user-change-password-dialog.component';
import { UserService } from '@core/services/user.service';
import { IUserInfo, IUserProfile } from '@core/interfaces/user.interface';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { HelperService } from '@core/services/helper.service';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { ClickOutsideModule } from '@core/directives/click-outside/click-outside.module';
import { HttpResponse } from "@angular/common/http";
import { Platform } from "@angular/cdk/platform";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "@shared/components/bottom-sheet/bottom-sheet.component";

interface SidebarItem {
  text: string;
  route: string;
  permissionName?: string[];
  hasBadge?: boolean
}

@Component({
  standalone: true,
  selector: 'em-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  imports: [
    AngularSvgIconModule,
    NgxPermissionsModule,
    ClickOutsideModule,
    RouterModule
  ],
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent extends DestroyableComponent implements OnInit {
  @Output() closed = this.register(new EventEmitter());
  appVersion = environment.appVersion;
  isTest = environment.isTest
  userProfile: IUserProfile;
  userInfo: IUserInfo;
  showDropdown: boolean;
  avatarImg: any;
  menus: SidebarItem[] = [
    {
      text: 'Аналитика',
      route: 'analytics',
      permissionName: ['Analytic']
    },
    {
      text: 'Клиенты',
      route: 'clients',
      permissionName: ['CompanyList']
    },
    {
      text: 'POS-терминал',
      route: 'main-terminal',
      permissionName: ['PosTerminalList']
    },
    {
      text: 'Платежи',
      route: 'transactions',
      permissionName: ['PaymentList']
    },
    {
      text: 'Авансовые выплаты',
      route: 'advance',
      permissionName: ['AdvancePayoutList']
    },
    {
      text: 'Заявки на возврат',
      route: 'payments-refund-applications',
      permissionName: ['PaymentRefundApplicationList'],
      hasBadge: false
    },
    {
      text: 'Журнал задач',
      route: 'job-log',
      permissionName: ['JobLogList']
    },
    {
      text: 'Журнал событий IFT',
      route: 'ift-log',
      permissionName: ['InOutIFTRequestLogList']
    },
    {
      text: 'Рассылки',
      route: 'mailing',
      permissionName: ['MailingList']
    },
    {
      text: 'Акции банка',
      route: 'bank-promotion',
      permissionName: ['CashbackPromotionList']
    },
    {
      text: 'SMS и Уведомления',
      route: 'promotion-system',
      permissionName: ['NotificationSettingList']
    },
    {
      text: 'Вывод',
      route: 'withdrawal-amount',
      permissionName: ['IssueMoneyRegistryList']
    },
    {
      text: 'Реестры',
      route: 'register',
      permissionName: ['RegistryOfBalanceList']
    },
    {
      text: 'Заявки на подключение',
      route: 'company-registration-applications',
      permissionName: ['CompanyRegistrationApplicationStatusDictionary'],
      hasBadge: false
    },
    {
      text: 'Отчеты',
      route: 'report',
      permissionName: ['AdminReportQueueList']
    },
    {
      text: 'Сервисы',
      route: 'services',
      permissionName: ['ServiceList']
    },
    {
      text: 'Заказы',
      route: 'order',
      permissionName: ['OrderList']
    },
    {
      text: 'Лимиты',
      route: 'balance-limit',
      permissionName: ['MerchantLimitList', 'IFTLimitHistory']
    },
    {
      text: 'Пользователи',
      route: 'user',
      permissionName: ['AdminUserList', 'ClientUserList']
    },
    {
      text: 'Продолжение платежей',
      route: 'continue-rules',
      permissionName: ['PaymentContinueRuleList']
    },
    {
      text: 'Справочник',
      route: 'directory',
      permissionName: [
        'CashbackList',
        'CommissionList',
        'RegionList',
        'AreaList',
        'CityList',
        'BranchList',
        'CountryList',
        'CategoryList',
        'SubCategoryList',
        'MerchantWorkDayList',
        'CashbackLimitList',
        'BankList',
        'PosTypeList',
        'ResponsibleBankEmployeeList',
        'AdminUserRoleList',
        'ClientUserRoleList',
        'CompanySegmentList',
        'CompanyLegalFormList',
        'AccountTypeList',
        'AccountCategoryTypeList'
      ]
    },
    {
      text: 'Помощь',
      route: 'help',
      permissionName: ['SupportApplicationList']
    },
    {
      text: 'Настройки',
      route: 'setting',
      permissionName: ['SettingList']
    },
  ]
  userRoutes = [
    {
      text: 'Профиль',
      code: 'profile',
    },
    {
      text: 'Сменить пароль',
      code: 'change-password',
      permissionName: 'AdminUserChangePassword'
    }
  ]
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserService);
  private readonly helperService = inject(HelperService);
  private readonly messageService = inject(MessageService);
  private readonly platform = inject(Platform);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly permissionsService = inject(NgxPermissionsService);

  isMobile = this.platform.IOS || this.platform.ANDROID;

  ngOnInit(): void {
    this.getUserProfile();
    this.getUserInfo();
  }

  navigate(main: SidebarItem): void {
    main.hasBadge = false;
    if (this.isMobile) this.closed.emit();
    if (main.route === 'logout') {
      this.logout();
    }
  }

  showLogoutDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Вы действительно хотите покинуть страницу ?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.logout()
        }
      });
  }

  onSelect(code: string): void {
    if (code === 'profile') {
      this.showDropdown = false;
      const dialogRef = this.dialog.open(UserProfileDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        data: this.userProfile
      });
      dialogRef.afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.getUserInfo()
          this.getUserProfile()
        })
    } else if (code === 'change-password') {
      this.showDropdown = false;
      const dialogRef = this.dialog.open(UserChangePasswordDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        data: ''
      });
      dialogRef.afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => this.messageService.add({severity: ToastEnum.SUCCESS, summary: res}))
    }
  }

  private logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          localStorage.clear();
          this.tokenService.clearTokens();
          this.authService.temporaryToken = null;
          this.router.navigate(['/auth'])
            .catch();
        }
      });
  }

  private getUserProfile(): void {
    this.userService.getUserProfile()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.userProfile = {
            email: res.data.email,
            fullName: res.data.fullName,
            photoFileId: res.data.photoFileId,
            userName: res.data.userName,
            fileStorageUrl: res.meta.fileStorageUrl,
            fileStorageToken: res.meta.fileStorageToken
          };
          if (res.data.photoFileId) {
            this.getUploadAvatar(res.meta.fileStorageUrl, res.data.photoFileId, res.meta.fileStorageToken);
          }
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      });
  }

  private getUserInfo(): void {
    this.userService.getUserInfo()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.userInfo = res.data;

          const refundMenu = this.menus.find(menu => menu.route === 'payments-refund-applications');
          if (refundMenu) {
            refundMenu.hasBadge = this.userInfo.hasRefundApplication;
          }

          const companyMenu = this.menus.find(menu => menu.route === 'company-registration-applications');
          if (companyMenu) {
            companyMenu.hasBadge = this.userInfo.hasMerchantApplication;
          }
        }
      })
  }

  private getUploadAvatar(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: HttpResponse<Blob>) => this.createImageFromBlob(res.body))
  }

  private createImageFromBlob(image: Blob): void {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.avatarImg = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  openDropdown(): void {
    if (this.isMobile) {
      const routes = this.userRoutes.filter(item => this.permissionsService.getPermission(item.permissionName));
      if (!routes.length) return;
      this.bottomSheet.open(BottomSheetComponent, {
        panelClass: 'bottom-sheet',
        data: {
          dataSource: routes,
          labelKey: 'text'
        },
      })
        .afterDismissed()
        .subscribe(option => option && this.onSelect(option.code));
    } else {
      this.showDropdown = !this.showDropdown;
    }
  }

}
