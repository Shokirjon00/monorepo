import { ITab } from '@eskhata/util';

export class DirectoryConstants {

  static readonly HEADER_TABS: ITab[]= [
    {
      label:'Ставки кэшбэков',
      path: '/directory/cashback-rates',
      selected: true,
      permissionName: 'CashbackList',
    },
    {
      label:'Комиссии',
      path: '/directory/commission',
      selected: false,
      permissionName: 'CommissionList',
    },
    {
      label:'Регион',
      path: '/directory/region',
      selected: false,
      permissionName: 'RegionList',
    },
    {
      label:'Район',
      path: '/directory/area',
      selected: false,
      permissionName: 'AreaList',
    },
    {
      label:'Город',
      path: '/directory/city',
      selected: false,
      permissionName: 'CityList',
    },
    {
      label:'Филиалы',
      path: '/directory/branch',
      selected: false,
      permissionName: 'BranchList',
    },
    {
      label: 'Шаблон назначения',
      path: '/directory/payment-purposes',
      selected: false,
      permissionName: 'PaymentPurposeList'
    },
    {
      label: 'Страна',
      path: '/directory/country',
      selected: false,
      permissionName: 'CountryList'
    },
    {
      label: 'Категории',
      path: '/directory/categories',
      selected: false,
      permissionName: 'CategoryList'
    },
    {
      label: 'Подкатегории',
      path: '/directory/subcategories',
      selected: false,
      permissionName: 'SubCategoryList'
    },
    {
      label: 'Рабочие дни',
      path: '/directory/working-day',
      selected: false,
      permissionName: 'MerchantWorkDayList'
    },
    {
      label: 'Условия кэшбэка',
      path: '/directory/cashback-limit',
      selected: false,
      permissionName: 'CashbackLimitList'
    },
    {
      label: 'Банки',
      path: '/directory/bank',
      selected: false,
      permissionName: 'BankList'
    },
    {
      label: 'Тип устройства',
      path: '/directory/device-type',
      selected: false,
      permissionName: 'PosTypeList'
    },
    {
      label: 'Модели терминалов',
      path: '/directory/terminal-models',
      selected: false,
      permissionName: ''
    },
    {
      label: 'Тип комиссии',
      path: '/directory/commission-type',
      selected: false,
      permissionName: 'CommissionTypeList'
    },
    {
      label: 'Ответственный сотрудник',
      path: '/directory/res-bank-emp',
      selected: false,
      permissionName: 'ResponsibleBankEmployeeList'
    },
    {
      label: 'Роль администратора',
      path: '/directory/admin-roles',
      selected: false,
      permissionName: 'AdminUserRoleList'
    },
    {
      label: 'Роль клиента',
      path: '/directory/client-roles',
      selected: false,
      permissionName: 'ClientUserRoleList'
    },
    {
      label: 'Роль пользователя',
      path: '/directory/user-roles',
      selected: false,
      permissionName: 'PosTerminalUserRoleList'
    },
    {
      label: 'Сегмент организации',
      path: '/directory/company-segment',
      selected: false,
      permissionName: 'CompanySegmentList'
    },
    {
      label: 'Форма собственности',
      path: '/directory/legal-form',
      selected: false,
      permissionName: 'CompanyLegalFormList'
    },
    {
      label: 'Тип счета',
      path: '/directory/account-type',
      selected: false,
      permissionName: 'AccountTypeList'
    },
    {
      label: 'Тип задачи',
      path: '/directory/job-log-types',
      selected: false,
      permissionName: 'JobLogTypeList'
    },
    {
      label: 'Причина отказа',
      path: '/directory/refund-reason',
      selected: false,
      permissionName: 'PaymentRefundReasonList'
    },
    {
      label: 'Валюта',
      path: '/directory/currency',
      selected: false,
      permissionName: 'CurrencyList'
    },
    {
      label: 'Категория типа счета',
      path: '/directory/account-category-type',
      selected: false,
      permissionName: 'AccountCategoryTypeList'
    },
    {
      label: 'Категория обращений' ,
      path: '/directory/appeal-category',
      selected: false,
      permissionName: 'SupportApplicationCategoryList'
    },
    {
      label: 'Доп.параметры',
      path: '/directory/directory-options',
      selected: false,
      permissionName: 'ServiceParamList'
    },
    {
      label: 'Интеграционные сервисы',
      path: '/directory/integration-services',
      selected: false,
      permissionName: 'AccountCategoryTypeList'
    },
    {
      label: 'Статусы заявок',
      path: '/directory/application-status',
      selected: false,
      permissionName: 'MerchantApplicationStatusList'
    },
    {
      label: 'Ведомство (МинФин)',
      path: '/directory/department-code',
      selected: false,
      permissionName: 'MerchantGovernmentDepartmentList'
    },
    {
      label: 'Класс дохода (МинФин)',
      path: '/directory/income-code',
      selected: false,
      permissionName: 'MerchantGovernmentIncomeList'
    },
    {
      label: 'Детальный статус платежей',
      path: '/directory/payment-status-detail',
      selected: false,
      permissionName: 'PaymentStatusDetailList'
    }
  ];
}
