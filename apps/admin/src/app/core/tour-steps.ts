import { TourStep } from "@core/interfaces/tour-steps";

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/analytics',
    element: '#newTabs',
    title: 'Новые вкладки',
    description: 'Добавлены вкладки «Входящие» и «Исходящие» транзакции для более детального анализа денежных потоков.',
    side: 'top',
    align: 'start',
  }
];
