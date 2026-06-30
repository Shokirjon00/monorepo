import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  TemplateRef,
  ViewEncapsulation,
  input,
  viewChild
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SvgIconComponent } from 'angular-svg-icon';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { IMessage } from '@core/interfaces/message.interface';

@Component({
  selector: 'em-toast-item',
  templateUrl: './toast-item.component.html',
  styleUrls: ['./toast-item.component.scss'],
  animations: [
    trigger('messageState', [
      state(
        'visible',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void => *', [
        style({ transform: '{{showTransformParams}}', opacity: 0 }),
        animate('{{showTransitionParams}}'),
      ]),
      transition('* => void', [
        animate(
          '{{hideTransitionParams}}',
          style({
            height: 0,
            opacity: 0,
            transform: '{{hideTransformParams}}',
          })
        ),
      ]),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgIconComponent, NgTemplateOutlet, CommonModule],
})
export class ToastItemComponent implements AfterViewInit, OnDestroy {
  readonly message: any = input<IMessage>();

  readonly index = input<number>();

  readonly template = input<TemplateRef<any>>();

  readonly showTransformOptions = input<string>();

  readonly hideTransformOptions = input<string>();

  readonly showTransitionOptions = input<string>();

  readonly hideTransitionOptions = input<string>();

  @Output() clos: EventEmitter<any> = new EventEmitter();

  readonly containerViewChild = viewChild<ElementRef>('container');

  timeout: any;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initTimeout();
  }

  onMouseEnter(): void {
    this.clearTimeout();
  }

  onMouseLeave(): void {
    this.initTimeout();
  }

  onCloseIconClick(event: any): void {
    this.clearTimeout();

    this.clos.emit({
      index: this.index(),
      message: this.message(),
    });

    event.preventDefault();
  }

  private initTimeout(): void {
    if (!this.message().sticky) {
      this.zone.runOutsideAngular(() => {
        this.timeout = setTimeout(() => {
          this.clos.emit({
            index: this.index(),
            message: this.message(),
          });
        }, this.message().life || 3000);
      });
    }
  }

  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }
}
