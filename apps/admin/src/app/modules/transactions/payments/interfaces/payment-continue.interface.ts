export interface IPaymentContinue {
  message: string;
  detailStatuses: IDetailStatuses[];
}

interface IDetailStatuses {
  id: string;
  isCorrect: boolean;
  message: string;
  status: boolean;
  name: string,
  description: string
}
