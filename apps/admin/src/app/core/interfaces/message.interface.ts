import {ToastEnum} from '@eskhata/util';

export interface IMessage {
  severity?: ToastEnum;
  summary?: string;
  detail?: string;
  id?: any;
  key?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
  icon?: string;
  contentStyleClass?: string;
  styleClass?: string;
  isSelected?: boolean;
}
