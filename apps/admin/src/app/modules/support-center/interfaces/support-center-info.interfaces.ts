export interface ISupportCenterInfoInterfaces {
  name: string;
  supportApplicationCategoryName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  isCompleted: boolean;
  supportApplicationMessages: ISupportApplication[];
}

interface ISupportApplication {
  userFullName: string,
  message: string,
  sentAt: string,
  subTitle: string,
  isAdminUser: boolean,
  fileIds: []
}
