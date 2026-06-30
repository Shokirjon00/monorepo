export interface ISmsNotification {
  messengers?: IMessage[];
  messageText: string;
  mobileOperators?: IMessage[];
  messageSendingPriorities?: IMessage[];
}

export interface IMessage {
  id: string;
  code: string;
  name: string;
  isSelected: boolean;
}
