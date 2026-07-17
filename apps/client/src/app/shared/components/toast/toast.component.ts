import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  input,
  viewChild,
  inject,
  output,
  contentChildren
} from '@angular/core';
import { animateChild, query, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { MessageService } from '@core/services/message.service';
import { IMessage } from '@core/interfaces/message.interface';
import { PrimeTemplateDirective } from '@core/directives/prime-template/prime-template';
import { PrimeNgConfigService } from '@core/services/prime-ng-config.service';
import Zindexutils from '@core/utils/zindexutils';
import { UniqueComponentId } from '@core/utils/uniquecomponentid';
import { ObjectUtils } from '@eskhata/util';
import { ToastItemComponent } from '@shared/components/toast/toast-item/toast-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'em-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [trigger('toastAnimation', [transition(':enter, :leave', [query('@*', animateChild())])])],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ToastItemComponent, CommonModule],
})
export class ToastComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly key = input<string>();
  readonly autoZIndex = input<boolean>(true);
  readonly baseZIndex = input<number>(0);
  readonly style = input<any>();
  readonly styleClass = input<string>();
  readonly position = input<string>('top-right');
  readonly preventOpenDuplicates = input<boolean>(false);
  readonly preventDuplicates = input<boolean>(false);
  readonly showTransformOptions = input<string>('translateY(100%)');
  readonly hideTransformOptions = input<string>('translateY(-100%)');
  readonly showTransitionOptions = input<string>('300ms ease-out');
  readonly hideTransitionOptions = input<string>('250ms ease-in');
  readonly breakpoints = input<any>();
  readonly clos = output<any>();
  readonly containerViewChild = viewChild<ElementRef>('container');
  readonly templates = contentChildren(PrimeTemplateDirective);
  messageSubscription: Subscription;
  clearSubscription: Subscription;
  messages: IMessage[];
  messagesArchieve: IMessage[];
  template: TemplateRef<any>;
  styleElement: any;
  id: string = UniqueComponentId();
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);
  config = inject(PrimeNgConfigService);

  ngOnInit(): void {
    this.messageSubscription = this.messageService.messageObserver.subscribe(messages => {
      if (messages) {
        if (messages instanceof Array) {
          const filteredMessages = messages.filter(m => this.canAdd(m));
          this.add(filteredMessages);
        } else if (this.canAdd(messages)) {
          this.add([messages]);
        }
      }
    });

    this.clearSubscription = this.messageService.clearObserver.subscribe(key => {
      if (key) {
        if (this.key() === key) {
          this.messages = null;
        }
      } else {
        this.messages = null;
      }

      this.cd.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    if (this.breakpoints()) {
      this.createStyle();
    }
    this.templates().forEach(item => {
      switch (item.getType()) {
        case 'message':
          this.template = item.template;
          break;

        default:
          this.template = item.template;
          break;
      }
    });
  }

  onAnimationStart(event: any): void {
    if (event.fromState === 'void') {
      this.containerViewChild().nativeElement.setAttribute(this.id, '');
      const containerViewChild = this.containerViewChild();
      if (this.autoZIndex() && containerViewChild.nativeElement.style.zIndex === '') {
        Zindexutils.set('modal', containerViewChild.nativeElement, this.baseZIndex() || this.config.zIndex.modal);
      }
    }
  }

  onMessageClose(event: any): void {
    this.messages.splice(event.index, 1);

    this.clos.emit({
      message: event.message,
    });

    this.cd.detectChanges();
  }

  onAnimationEnd(event: any): void {
    if (event.toState === 'void') {
      if (this.autoZIndex() && ObjectUtils.isEmpty(this.messages)) {
        Zindexutils.clear(this.containerViewChild().nativeElement);
      }
    }
  }

  private add(messages: IMessage[]): void {
    this.messages = this.messages ? [...this.messages, ...messages] : [...messages];

    if (this.preventDuplicates()) {
      this.messagesArchieve = this.messagesArchieve ? [...this.messagesArchieve, ...messages] : [...messages];
    }

    this.cd.markForCheck();
  }

  private canAdd(message: IMessage): boolean {
    let allow = this.key() === message.key;

    if (allow && this.preventOpenDuplicates()) {
      allow = !this.containsMessage(this.messages, message);
    }

    if (allow && this.preventDuplicates()) {
      allow = !this.containsMessage(this.messagesArchieve, message);
    }

    return allow;
  }

  private containsMessage(collection: IMessage[], message: IMessage): boolean {
    if (!collection) {
      return false;
    }

    return (
      collection.find(m => {
        return m.summary === message.summary && m.detail == message.detail && m.severity === message.severity;
      }) != null
    );
  }

  private createStyle(): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.type = 'text/css';
      document.head.appendChild(this.styleElement);
      let innerHTML = '';
      for (let breakpoint in this.breakpoints()) {
        let breakpointStyle = '';
        for (let styleProp in this.breakpoints()[breakpoint]) {
          breakpointStyle += styleProp + ':' + this.breakpoints()[breakpoint][styleProp] + ' !important;';
        }
        innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-toast[${this.id}] {
                           ${breakpointStyle}
                        }
                    }
                `;
      }

      this.styleElement.innerHTML = innerHTML;
    }
  }

  private destroyStyle(): void {
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    const containerViewChild = this.containerViewChild();
    if (containerViewChild && this.autoZIndex()) {
      Zindexutils.clear(containerViewChild.nativeElement);
    }

    if (this.clearSubscription) {
      this.clearSubscription.unsubscribe();
    }

    this.destroyStyle();
  }
}
