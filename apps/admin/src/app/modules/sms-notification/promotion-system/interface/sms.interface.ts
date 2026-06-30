export interface ISMS {
  id: string,
  name?: string,
  description: string,
  modifiedAt: number,
  botHash: string;
  groupsId: any;
  delay: string;
  interval: string;
  isActive: boolean;
  lastSendDateTime:  string;
  message: string;
  triggerCount: number;
  triggerPrice: number;
}
