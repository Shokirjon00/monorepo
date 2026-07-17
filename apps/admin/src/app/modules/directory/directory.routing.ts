import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import {APPLICATION_STATUS_ROUTES} from "@modules/directory/application-status/application-status.routing";

export const DIRECTORY: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./directory.component').then(c => c.DirectoryComponent),
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: '',
        redirectTo: 'cashback-rates',
        pathMatch: 'full'
      },
      {
        path: 'cashback-rates',
        loadChildren: (): any => import('./cashback-rates/cashback-rates.routing').then(m => m.CASHBACK_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Ставки кэшбэков',
          permissions: {
            only: 'CashbackList',
            redirectTo: 'directory/commission'
          }
        }
      },
      {
        path: 'commission',
        loadChildren: (): any => import('./commission/commission.routing').then(m => m.COMMISSION_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Комиссии',
          permissions: {
            only: 'CommissionList',
            redirectTo: 'directory/region'
          }
        }
      },
      {
        path: 'region',
        loadChildren: (): any => import('./../directory/region/region.routing').then(m => m.REGION_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Регион',
          permissions: {
            only: 'RegionList',
            redirectTo: 'directory/area'
          }
        }
      },
      {
        path: 'area',
        loadChildren: (): any => import('./../directory/area/area.routing').then(m => m.AREA_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Район',
          permissions: {
            only: 'AreaList',
            redirectTo: 'directory/city'
          }
        }
      },
      {
        path: 'payment-purposes',
        loadChildren: (): any => import('./payment-purposes/payment-purposes.routing').then(m => m.DESTINATION_TEMPLATE_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Шаблон назначения',
          permissions: {
            only: 'PaymentPurposeList',
            redirectTo: 'directory/city'
          }
        }
      },
      {
        path: 'city',
        loadChildren: (): any => import('./../directory/city/city.routing').then(m => m.CITY_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Город',
          permissions: {
            only: 'CityList',
            redirectTo: 'directory/branch'
          }
        }
      },
      {
        path: 'branch',
        loadChildren: (): any => import('./branch/branch-routing').then(m => m.BRANCH_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Филиал',
          permissions: {
            only: 'BranchList',
            redirectTo: 'directory/country'
          }
        }
      },
      {
        path: 'country',
        loadChildren: (): any => import('./../directory/country/country.routing').then(m => m.COUNTRY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Страна',
          animation: true,
          permissions: {
            only: 'CountryList',
            redirectTo: 'directory/categories'
          }
        }
      },
      {
        path: 'categories',
        loadChildren: (): any => import('./category/category.routing').then(m => m.CATEGORY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Категории',
          permissions: {
            only: 'CategoryList',
            redirectTo: 'directory/subcategories'
          }
        }
      },

      {
        path: 'subcategories',
        loadChildren: (): any => import('./subcategory/subcategory.routing').then(m => m.SUBCATEGORY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Подкатегории',
          permissions: {
            only: 'SubCategoryList',
            redirectTo: 'directory/working-day'
          }
        }
      },
      {
        path: 'working-day',
        loadChildren: (): any => import('./working-day/working-day.routing').then(m => m.WORKING_DAY_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Рабочие дни',
          permissions: {
            only: 'MerchantWorkDayList',
            redirectTo: 'directory/bank'
          }
        }
      },
      {
        path: 'bank',
        loadChildren: (): any => import('./bank/bank.routing').then(m => m.BANK_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Банк',
          permissions: {
            only: 'BankList',
            redirectTo: 'directory/device-type'
          }
        }
      },
      {
        path: 'device-type',
        loadChildren: (): any => import('./device-type/device-type.routing').then(m => m.DEVICE_TYPE_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Тип устройства',
          permissions: {
            only: 'PosTypeList',
            redirectTo: 'directory/cashback-limit'
          }
        }
      },
      {
        path: 'terminal-models',
        loadChildren: (): any => import('./terminal-models/terminal-models.routing').then(m => m.TERMINAL_MODELS_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Модели терминалов',
          permissions: {
            only: '',
            redirectTo: 'directory/device-type'
          }
        }
      },
      {
        path: 'commission-type',
        loadChildren: (): any => import('./commission-type/commission-type.routing').then(m => m.COMMISSION_TYPE_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Тип комиссии',
          permissions: {
            only: 'CommissionTypeList',
            redirectTo: 'directory/commission'
          }
        }
      },
      {
        path: 'cashback-limit',
        loadChildren: (): any => import('./cashback-limit/cashback-limit.routing').then(m => m.CASHBACK_LIMIT_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Кешбек лимит',
          permissions: {
            only: 'CashbackLimitList',
            redirectTo: 'directory/res-bank-emp'
          }
        }
      },

      {
        path: 'res-bank-emp',
        loadChildren: (): any => import('./responsible-bank-employees/responsible-bank-employees.routing').then(m => m.RES_BANK_EMP_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Ответственный сотрудник',
          permissions: {
            only: 'ResponsibleBankEmployeeList',
            redirectTo: 'directory/admin-roles'
          }
        }
      },
      {
        path: 'admin-roles',
        loadChildren: (): any => import('./admin-role/admin-role.routing').then(m => m.ADMIN_ROLES_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Роль администратора',
          permissions: {
            only: 'AdminUserRoleList',
            redirectTo: 'directory/client-roles'
          }
        }
      },
      {
        path: 'client-roles',
        loadChildren: (): any => import('./client-role/client-role.routing').then(m => m.CLIENT_ROLES_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Роль клиента',
          permissions: {
            only: 'PosTerminalUserRoleList',
            redirectTo: 'directory/company-segment'
          }
        }
      },
      {
        path: 'user-roles',
        loadChildren: (): any => import('./user-role/user-role.routing').then(m => m.USER_ROLES_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Роль пользователя',
          permissions: {
            only: 'ClientUserRoleList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'company-segment',
        loadChildren: (): any => import('./company-segment/company-segment.routing').then(m => m.COMPANY_SEGMENT_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Сегмент организации',
          permissions: {
            only: 'CompanySegmentList',
            redirectTo: 'directory/legal-form'
          }
        }
      },
      {
        path: 'legal-form',
        loadChildren: (): any => import('./company-legal-form/company-legal-form.routing').then(m => m.LEGAL_FORM_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Форма собственности',
          permissions: {
            only: 'CompanyLegalFormList',
            redirectTo: 'directory/account-type'
          }
        }
      },
      {
        path: 'account-type',
        loadChildren: (): any => import('./account-type/account-type.routing').then(m => m.ACCOUNT_TYPE_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Тип счета',
          permissions: {
            only: 'AccountTypeList',
            redirectTo: 'directory/account-category-type'
          }
        }
      },
      {
        path: 'job-log-types',
        loadChildren: (): any => import('./job-log-types/jobLogTypes.routing').then(m => m.JobLogTypesRouting),
        data: {
          animation: true,
          breadcrumb: 'Тип задачи',
          permissions: {
            only: 'JobLogTypeList',
            redirectTo: 'directory/job-log-typelist'
          }
        }
      },
      {
        path: 'refund-reason',
        loadChildren: (): any => import('./payment-refund-reason/payment-refund-reason.routing').then(m => m.CATEGORY_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Причина отказа',
          permissions: {
            only: 'PaymentRefundReasonList',
            redirectTo: 'directory/account-category-type'
          }
        }
      },
      {
        path: 'currency',
        loadChildren: (): any => import('./currency/currency.routing').then(m => m.CURRENCY_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Валюта',
          permissions: {
            only: 'CurrencyList',
            redirectTo: 'directory/currency'
          }
        }
      },
      {
        path: 'account-category-type',
        loadChildren: (): any => import('./account-category-type/account-category-type.routing').then(m => m.ACCOUNT_CATEGORY_TYPE_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Категория типа счета',
          permissions: {
            only: 'AccountCategoryTypeList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'directory-options',
        loadChildren: (): any => import('./directory-options/directory-options.routing').then(m => m.DIRECTORY_OPTIONS_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Доп.параметры',
          permissions: {
            only: 'ServiceParamList',
            redirectTo: 'directory/directory-options'
          }
        }
      },
      {
        path: 'integration-services',
        loadChildren: (): any => import('./integration-service/integration-service.routing').then(m => m.INTEGRATION_SERVICE),
        canActivate: [NgxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Интеграционные сервисы',
          permissions: {
            only: 'AccountCategoryTypeList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'appeal-category',
        loadChildren: (): any => import('./appeal-category/appeal-category.routing').then(m => m.APPEAL_CATEGORY_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Категория обращений',
          permissions: {
            only: 'SupportApplicationCategoryList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'payment-status-detail',
        loadChildren: (): any => import('./payment-status/payment-status.routing').then(m => m.PAYMENT_STATUS_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Детальный статус платежей',
          permissions: {
            only: 'PaymentStatusDetailList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'application-status',
        loadChildren: (): any => import('./application-status/application-status.routing').then(m => m.APPLICATION_STATUS_ROUTES),
        data: {
          animation: true,
          breadcrumb: 'Статусы заявок',
          permissions: {
            only: 'MerchantApplicationStatusList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'department-code',
        loadChildren: (): any => import('./departament-code/department-code.routing').then(m => m.DEPARTMENT_CODE_ROUTING),
        data: {
          animation: true,
          breadcrumb: 'Ведомство (МинФин)',
          permissions: {
            only: 'MerchantGovernmentDepartmentList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'income-code',
        loadChildren: (): any => import('./income-code/income-code.routing').then(m => m.IncomeCodeRouting),
        data: {
          animation: true,
          breadcrumb: 'Класс дохода (МинФин)',
          permissions: {
            only: 'MerchantGovernmentIncomeList',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  },
]
