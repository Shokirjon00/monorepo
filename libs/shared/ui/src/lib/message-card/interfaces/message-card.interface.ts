export interface IMessageCard {
  userFullName: string;
  message: string;
  sentAt: string;
  subTitle?: string;
  fileIds?: string[];
  isAdminUser: boolean;
  supportApplicationId: string;
}
