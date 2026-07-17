export class StatusTypeConstants {

  static statuses = [
    { key: 'Активный', value: 'true' },
    { key: 'Неактивный', value: 'false' },
  ];

  static payment_status = [
    { id:"434a4d68-cf35-4adc-8d9a-d26dcdcdf87a", key: 'Отказано', value: 'Refused' },
    { id:"4aa6ab6e-669f-4b25-a79d-edad8a865296", key: 'Не подтвержден', value: 'Confirmed' },
    { id:"5419a575-1c42-475e-90bc-5e16767ec806", key: 'Исполнено', value: 'Completed' },
    { id:"5d9121ed-f1a4-4a47-9ae7-26735e942468", key: 'Возвращено', value: 'Returned' },
    { id:"e3f29ae4-05c0-4868-85a4-b0399b4e29d6", key: 'В обработке', value: 'In-process' },
    { id:"5a7eb022-be48-4b9d-a032-d23de35239cd", key: 'Отменено', value: 'Canceled' },
    { id:"54bc215d-b18b-4a57-aaaf-a506984ceca3", key: 'Неизвеcтно', value: 'Unknown' },
  ];

  static refundApplicationStatus = [
    {key: 'Новая', value: '3949123c-1cf1-4606-b064-25e4871bb8f2'},
    {key: 'В обработке', value: '772281a9-2acf-4ce3-b306-cbbf0f9c9799'},
    {key: 'Отклонена', value: '87c783ca-2ed1-438f-8200-544c28fcc8d6'},
    {key: 'Одобрена', value: 'd1bd6438-9436-4dab-b263-63ee6c1f59d3'}
  ];

  static sendType = [
    {key: 'Входящий', value: 'true'},
    {key: 'Исходящий', value: 'false'},
  ];

  static refundType = [
    {key: 'Да', value: 'true'},
    {key: 'нет', value: 'false'},
  ];

  static type = [
    {key: 'Создано', value: 'Create'},
    {key: 'Изменено', value: 'Update'},
    {key: 'Удалено', value: 'Delete'},
  ];
}
