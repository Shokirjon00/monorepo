interface Message {
  text: string;
  icon: string;
  isVisible: boolean;
}

export interface IMessage {
  [key: string]: Message;
}
