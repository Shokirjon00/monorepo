export interface TourStep {
  route: string;
  element: string;
  title: string;
  description: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  permission?: string;
  getIdFn?: () => Promise<string | null>;
}
