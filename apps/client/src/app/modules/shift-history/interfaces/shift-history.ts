export interface IShiftHistory {
  id: string;
  statusName: string;
  isActive: boolean;
  posTerminalUserFullName: string;
  issueChangesCount: string;
  issueChangesSum: string;
  canceledPaymentsCount: string;
  canceledPaymentsSum: string;
  refundedPaymentsCount: string;
  refundedPaymentsSum: string;
  completedPaymentsCount: string;
  completedPaymentsSum: string;
  endDate: string;
  startDate: string;
  shiftNumber: string;
  posTerminalNumber: string;
  posName: string;
  merchantName: string;
  name: string;
}
