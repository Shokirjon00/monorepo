import { TableStatusEnum } from '@eskhata/util';

export class TableConstants {
  static readonly paymentStatusClasses: { [key: string]: string } = {
    [TableStatusEnum.COMPLETED]: 'completed',
    [TableStatusEnum.REJECTED]: 'rejected',
    [TableStatusEnum.NO_VERIFIED]: 'no-verified',
    [TableStatusEnum.IN_PROCESS]: 'in-process',
    [TableStatusEnum.RETURNED]: 'returned',
    [TableStatusEnum.UNKNOWN]: 'unknown',
    [TableStatusEnum.CANCELED]: 'canceled',
  };

  static readonly applicationStatusClasses: { [key: string]: string } = {
    [TableStatusEnum.APPLICATION_COMPLETED]: 'completed',
    [TableStatusEnum.APPLICATION_REJECTED]: 'rejected',
    [TableStatusEnum.APPLICATION_NEW]: 'no-verified',
    [TableStatusEnum.APPLICATION_IN_PROCESS]: 'in-process',
    [TableStatusEnum.ADVANCE_NEW]: 'no-verified',
    [TableStatusEnum.ADVANCE_IN_PROCESS]: 'in-process',
    [TableStatusEnum.ADVANCE_ISSUED]: 'completed',
    [TableStatusEnum.ADVANCE_REPAID]: 'process-completed',
    [TableStatusEnum.ADVANCE_OVERDUE]: 'rejected',
    [TableStatusEnum.ADVANCE_REJECTED]: 'canceled',
    [TableStatusEnum.ADVANCE_UNKNOWN]: 'unknown',
  };

  static readonly supportStatusClasses: { [key: string]: string } = {
    [TableStatusEnum.SUPPORT_NEW]: 'process-completed',
    [TableStatusEnum.SUPPORT_COMPLETED]: 'completed',
    [TableStatusEnum.SUPPORT_IN_PROCESS]: 'in-process',
    [TableStatusEnum.SUPPORT_REJECTED]: 'rejected',
    [TableStatusEnum.SUPPORT_CANCELED]: 'canceled',
  };

  static readonly isuStatusClasses: { [key: string]: string } = {
    [TableStatusEnum.ISU_COMPLETED]: 'completed',
    [TableStatusEnum.ISU_STARTED]: 'process-completed',
    [TableStatusEnum.ISU_IN_PROCESS]: 'in-process',
    [TableStatusEnum.ISU_REJECTED]: 'rejected',
  };

  static readonly orderStatusClasses: { [key: string]: string } = {
    COMPLETED: 'completed',
    CANCELED: 'rejected',
    PAYED: 'unknown',
  };
}
