export class MerchantInfoMobileCardConstants {

  static readonly MERCHANT_DETAIL_DUMP = [
    {
      side: 'left',
      fields: [
        { label: 'Название точки', key: 'name' },
        { label: 'Регион', key: 'regionName' },
        { label: 'Район', key: 'areaName' },
        { label: 'Город', key: 'cityName' },
        { label: 'Адрес', key: 'address' },
        { label: 'Телефон точки', key: 'merchantContactJson.phoneNumber' },
        { label: 'Телефон владельца', key: 'merchantContactJson.managerPhoneNumber' },
        { label: 'E-mail', key: 'merchantContactJson.email' },
        { label: 'Владелец', key: 'merchantContactJson.managerName' },
        { label: 'Филиал', key: 'branchName' },
        { label: 'Названия расчетного счета', key: 'paymentAccountName' },
        { label: 'Номер расчетного счета', key: 'paymentAccountNumber' },
        { label: 'Расчетный счет карты', key: 'paymentCardAccountName' },
      ]
    },
    {
      side: 'right',
      fields: [
        { label: 'Проверено', key: 'verifiedName' },
        { label: 'Категория', key: 'categoryName' },
        { label: 'Подкатегория', key: 'subCategoryName' },
        { label: 'Рабочие дни', key: 'workDayName' },
        { label: 'Подробное описание точки', key: 'description' },
        { label: 'ID в EQMS', key: 'extCodeEqms' },
      ]
    }
  ]
}
