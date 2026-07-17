export interface IRatingDashboard {
  overallRatings: {
    overallRating: number;
    delta: number;
    chartData: { series: { name: string; data: number[] }[]; dates: string[] };
  };
  orderReviews: {
    quantity: number;
    rating: number;
    delta: number;
    chartData: { rating: number; quantity: number; percentage: number }[];
  };
  cancellationRating: {
    ordersQuantity: number;
    canceledOrdersQuantity: number;
    canceledOrdersPercentage: number;
    cancelReason: string;
    rating: number;
    delta: number;
    label: { text: string; type: string };
  };
  reactionTimeRating: {
    rating: number;
    delta: number;
    averageReactionTime: number;
    label: { text: string; type: string };
  };
}
