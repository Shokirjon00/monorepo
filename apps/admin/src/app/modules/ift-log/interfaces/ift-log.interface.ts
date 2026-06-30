export interface IIftLog {
  id: string;
  errorDescription?: string;
  logType: string;
  messageName: string;
  messageType: string;
  requestDateTime: string;
  data?: string;
}
