import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  standalone: true,
  selector: 'em-qr-pos-panel',
  templateUrl: './qr-pos-panel.component.html',
  styleUrls: ['./qr-pos-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AngularSvgIconModule],
})
export class QrPosPanelComponent implements OnDestroy {
  readonly title = input<string>('');
  readonly empty = input<boolean>(false);
  readonly emptyText = input<string>('Нет данных');

  readonly expanded = signal(false);
  readonly closing = signal(false);
  readonly isFull = computed(() => this.expanded() || this.closing());

  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly renderer = inject(Renderer2);
  private readonly doc = inject(DOCUMENT);
  private backdrop: HTMLElement | null = null;

  private static readonly ACCENT_CLASSES = [
    'acc-green', 'acc-blue', 'acc-purple', 'acc-orange', 'acc-indigo', 'acc-teal', 'acc-red',
  ];

  toggleExpand(): void {
    if (this.expanded()) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand(): void {
    if (this.expanded()) return;
    this.closing.set(false);
    this.createBackdrop();
    this.carryAccent();
    this.renderer.appendChild(this.doc.body, this.panelRef().nativeElement);
    this.renderer.addClass(this.doc.body, 'qr-pos-fs-lock');
    this.expanded.set(true);
    this.dispatchResize();
  }

  collapse(): void {
    if (!this.expanded()) return;
    this.expanded.set(false);
    this.closing.set(true);
    if (this.backdrop) this.renderer.addClass(this.backdrop, 'is-closing');

    const panel = this.panelRef().nativeElement;
    const stop = this.renderer.listen(panel, 'animationend', (e: AnimationEvent) => {
      if (e.target !== panel) return;
      stop();
      this.finishCollapse();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.expanded()) this.collapse();
  }

  ngOnDestroy(): void {
    this.removeBackdrop();
    this.renderer.removeClass(this.doc.body, 'qr-pos-fs-lock');
  }

  private finishCollapse(): void {
    this.closing.set(false);
    this.renderer.appendChild(this.host.nativeElement, this.panelRef().nativeElement);
    this.dropAccent();
    this.removeBackdrop();
    this.renderer.removeClass(this.doc.body, 'qr-pos-fs-lock');
    this.dispatchResize();
  }

  private dispatchResize(): void {
    const win = this.doc.defaultView;
    queueMicrotask(() => win?.dispatchEvent(new Event('resize')));
  }

  private carryAccent(): void {
    const host = this.host.nativeElement;
    const panel = this.panelRef().nativeElement;
    for (const cls of QrPosPanelComponent.ACCENT_CLASSES) {
      if (host.classList.contains(cls)) this.renderer.addClass(panel, cls);
    }
  }

  private dropAccent(): void {
    const panel = this.panelRef().nativeElement;
    for (const cls of QrPosPanelComponent.ACCENT_CLASSES) {
      this.renderer.removeClass(panel, cls);
    }
  }

  private createBackdrop(): void {
    this.removeBackdrop();
    const el = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(el, 'qr-pos-fs-backdrop');
    this.renderer.listen(el, 'click', () => this.collapse());
    this.renderer.appendChild(this.doc.body, el);
    this.backdrop = el;
  }

  private removeBackdrop(): void {
    if (this.backdrop) {
      this.renderer.removeChild(this.doc.body, this.backdrop);
      this.backdrop = null;
    }
  }
}
