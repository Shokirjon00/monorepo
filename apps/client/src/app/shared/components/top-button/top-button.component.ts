import { AfterViewInit, Component, DestroyRef, inject, PLATFORM_ID, signal, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter } from "rxjs/operators";
import { Router, Scroll } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { fromEvent } from "rxjs";

@Component({
  standalone: true,
  selector: 'em-top-button',
  templateUrl: './top-button.component.html',
  styleUrls: ['./top-button.component.scss'],
  imports: [
    SvgIconComponent
  ]
})
export class TopButtonComponent implements AfterViewInit {
  readonly scrollElement = input.required<HTMLElement>();
  readonly scrollThreshold = input<number>(700);

  readonly showScrollButton = signal<any>(false);

  private readonly router: Router = inject(Router);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    this.router.events
      .pipe(
        filter((event: any): event is Scroll => event instanceof Scroll),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res.anchor) {
          document.getElementById(res.anchor)?.scrollIntoView({behavior: 'smooth'});
        }
      });

    const scrollElement = this.scrollElement();
    if (scrollElement) {
      fromEvent(scrollElement, 'wheel')
        .pipe(
          distinctUntilChanged(),
          debounceTime(100),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.hideOrShowScrollButton())

      fromEvent(scrollElement, 'scroll')
        .pipe(
          distinctUntilChanged(),
          debounceTime(100),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.hideOrShowScrollButton())
    }
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollElement().scroll({top: 0, behavior: 'smooth'});
    }
  }

  private hideOrShowScrollButton(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.showScrollButton.set(this.scrollElement().scrollTop > this.scrollThreshold());
    }
  }
}
