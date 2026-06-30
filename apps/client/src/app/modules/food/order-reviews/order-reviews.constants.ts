export class OrderReviewsConstants {

  static readonly RATING_OPTIONS = [
    { id: 1, name: '1 звезда' },
    { id: 2, name: '2 звезды' },
    { id: 3, name: '3 звезды' },
    { id: 4, name: '4 звезды' },
    { id: 5, name: '5 звезд' },
  ];

  static readonly SORT_OPTIONS = [
    { id: 'CreatedDateTime desc', name: 'Сначала новые' },
    { id: 'CreatedDateTime asc', name: 'Сначала старые' },
  ];
}
