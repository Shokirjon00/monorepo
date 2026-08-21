import { AfterViewInit, Component, DestroyRef, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Router, Scroll } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { fromEvent } from 'rxjs';

/**
 * Two call styles are supported, matching what each app did before the merge:
 *
 * - `scrollElement` bound (client): the button watches that element and shows
 *   itself once past `scrollThreshold`.
 * - `scrollElement` omitted (admin): the button is always rendered — the parent
 *   decides when to show it — and scrolls the element matched by `selector`.
 */
@Component({
  standalone: true,
  selector: 'em-top-button',
  templateUrl: './top-button.component.html',
  styleUrls: ['./top-button.component.scss'],
  imports: [SvgIconComponent],
})
export class TopButtonComponent implements AfterViewInit {
  readonly scrollElement = input<HTMLElement | null>(null);
  readonly scrollThreshold = input<number>(700);

  /** Used only when `scrollElement` is not bound. */
  readonly selector = input<string>('.main-body');
  readonly topHeight = input<number>(0);

  readonly showScrollButton = signal<boolean>(false);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    const scrollElement = this.scrollElement();
    if (!scrollElement) {
      return;
    }

    this.router.events
      .pipe(
        filter((event: any): event is Scroll => event instanceof Scroll),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.anchor) {
          document.getElementById(res.anchor)?.scrollIntoView({ behavior: 'smooth' });
        }
      });

    fromEvent(scrollElement, 'wheel')
      .pipe(distinctUntilChanged(), debounceTime(100), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.hideOrShowScrollButton());

    fromEvent(scrollElement, 'scroll')
      .pipe(distinctUntilChanged(), debounceTime(100), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.hideOrShowScrollButton());
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const scrollElement = this.scrollElement();
    if (scrollElement) {
      scrollElement.scroll({ top: 0, behavior: 'smooth' });
      return;
    }

    document.querySelector(this.selector())?.scrollTo({ top: this.topHeight(), left: 0, behavior: 'smooth' });
  }

  private hideOrShowScrollButton(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.showScrollButton.set(this.scrollElement().scrollTop > this.scrollThreshold());
    }
  }
}
