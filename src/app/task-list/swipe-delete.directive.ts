import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appSwipeDelete]',
  standalone: true,
  exportAs: 'appSwipeDelete',
})
export class SwipeDeleteDirective implements OnInit, OnDestroy {
  isOpen = false;

  private startX      = 0;
  private startY      = 0;
  private currentX    = 0;
  private isHoriz: boolean | null = null;

  private readonly OPEN_X    = -80;
  private readonly THRESHOLD = 40;

  private get contentEl(): HTMLElement {
    return this.el.nativeElement.firstElementChild as HTMLElement;
  }

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const h = this.el.nativeElement;
    h.addEventListener('touchstart', this.onStart, { passive: true });
    h.addEventListener('touchmove',  this.onMove,  { passive: false });
    h.addEventListener('touchend',   this.onEnd,   { passive: true });
  }

  ngOnDestroy() {
    const h = this.el.nativeElement;
    h.removeEventListener('touchstart', this.onStart);
    h.removeEventListener('touchmove',  this.onMove);
    h.removeEventListener('touchend',   this.onEnd);
  }

  close() {
    this.isOpen = false;
    this.animate(0);
  }

  private onStart = (e: TouchEvent) => {
    this.startX   = e.touches[0].clientX;
    this.startY   = e.touches[0].clientY;
    this.currentX = this.isOpen ? this.OPEN_X : 0;
    this.isHoriz  = null;
  };

  private onMove = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - this.startX;
    const dy = e.touches[0].clientY - this.startY;

    if (this.isHoriz === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this.isHoriz = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!this.isHoriz) return;
    e.preventDefault();

    const base    = this.isOpen ? this.OPEN_X : 0;
    this.currentX = Math.min(0, Math.max(this.OPEN_X, base + dx));
    this.setTransform(this.currentX);
  };

  private onEnd = () => {
    if (!this.isHoriz) return;

    if (this.currentX < -this.THRESHOLD) {
      this.isOpen = true;
      this.animate(this.OPEN_X);
    } else {
      this.isOpen = false;
      this.animate(0);
    }
  };

  private setTransform(x: number) {
    const el = this.contentEl;
    el.style.transition = 'none';
    el.style.transform  = `translateX(${x}px)`;
  }

  private animate(x: number) {
    const el = this.contentEl;
    el.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
    el.style.transform  = `translateX(${x}px)`;
  }
}
