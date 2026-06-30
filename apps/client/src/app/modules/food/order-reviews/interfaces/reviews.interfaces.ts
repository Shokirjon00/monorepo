export interface IReview {
  restaurantPointName: string;
  order: {
    id: string;
    number: string;
    items: string[];
  };
  createdDateTime: string;
  createdByUser: string;
  rating: string;
  comment: string;
  starsArray?: number[];
}

export interface IRatingChartItem {
  rating: string;
  count: string;
  percentage: string;
}

export interface IReviewsData {
  reviews: IReview[];
  chartData: {
    totalCount: string;
    reviews: IRatingChartItem[];
  };
}

export type IReviewUI = IReview & { starsArray: number[] };
