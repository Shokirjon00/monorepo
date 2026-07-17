import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {IMessage} from '@core/interfaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messageSource = new Subject<IMessage|IMessage[]>();
  clearSource = new Subject<string>();
  messageObserver = this.messageSource.asObservable();
  clearObserver = this.clearSource.asObservable();

  add(message: IMessage): void {
    if (message) {
      this.messageSource.next(message);
    }
  }

  addAll(messages: IMessage[]): void {
    if (messages && messages.length) {
      this.messageSource.next(messages);
    }
  }

  clear(key?: string): void {
    this.clearSource.next(key||null);
  }

}
