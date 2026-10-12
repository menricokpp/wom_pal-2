import { useRef, useEffect, useState, useCallback } from 'react';

interface UseHorizontalScrollOptions {
  speed?: number;
  enableDrag?: boolean;
}

export function useHorizontalScroll<T extends HTMLElement>(options?: UseHorizontalScrollOptions) {
  const containerRef = useRef<T | null>(null);
  const speed = options?.speed ?? 1.2;
  const enableDrag = options?.enableDrag ?? true;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check scroll boundary status
  const updateScrollStatus = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const overflow = maxScroll > 4;

    setHasOverflow(overflow);
    setCanScrollLeft(overflow && scrollLeft > 5);
    setCanScrollRight(overflow && scrollLeft < maxScroll - 5);

    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, Math.round((scrollLeft / maxScroll) * 100)));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  }, []);

  // Update on scroll & resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollStatus();

    el.addEventListener('scroll', updateScrollStatus, { passive: true });
    window.addEventListener('resize', updateScrollStatus);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateScrollStatus();
      });
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', updateScrollStatus);
      window.removeEventListener('resize', updateScrollStatus);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateScrollStatus]);

  // Wheel conversion: translates vertical wheel scroll (deltaY) into horizontal scroll (scrollLeft)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If user holds Shift, native browser already scrolls horizontally
      if (e.shiftKey) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 4) return;

      // Handle pure horizontal scroll (e.g. mouse tilt or horizontal wheel)
      if (e.deltaX !== 0 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return; // allow native horizontal wheel
      }

      // Convert vertical mouse wheel deltaY to horizontal scroll
      if (e.deltaY !== 0) {
        const atStart = el.scrollLeft <= 2;
        const atEnd = Math.ceil(el.scrollLeft) >= maxScroll - 2;

        // If at boundaries and user scrolls further, let page scroll vertically
        if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) {
          return;
        }

        // Intercept and scroll horizontally smoothly
        e.preventDefault();
        el.scrollLeft += e.deltaY * speed;
        updateScrollStatus();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [speed, updateScrollStatus]);

  // Click & Drag to scroll horizontally
  useEffect(() => {
    if (!enableDrag) return;
    const el = containerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let hasMoved = false;

    const onMouseDown = (e: MouseEvent) => {
      // Only left mouse button
      if (e.button !== 0) return;

      // Ignore interactive elements
      const target = e.target as HTMLElement;
      if (
        ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button, input, select, a, [role="button"]')
      ) {
        return;
      }

      isDown = true;
      hasMoved = false;
      startX = e.pageX - el.offsetLeft;
      initialScrollLeft = el.scrollLeft;
    };

    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = '';
        el.style.removeProperty('user-select');
      }
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = '';
        el.style.removeProperty('user-select');
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;

      if (Math.abs(walk) > 4) {
        hasMoved = true;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
        e.preventDefault();
        el.scrollLeft = initialScrollLeft - walk;
        updateScrollStatus();
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, [enableDrag, updateScrollStatus]);

  // Helper scroll methods
  const scrollLeftBy = useCallback((pixels: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: pixels, behavior: 'smooth' });
    }
  }, []);

  const scrollToLeft = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToRight = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, []);

  return {
    containerRef,
    scrollLeftBy,
    scrollToLeft,
    scrollToRight,
    canScrollLeft,
    canScrollRight,
    scrollProgress,
    hasOverflow,
    updateScrollStatus,
  };
}
