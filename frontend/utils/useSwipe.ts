import { useState, TouchEvent } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

interface SwipeResult {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  handlers: SwipeHandlers;
}

/**
 * A simple custom hook for raw swipe detection without external libraries.
 */
export const useSwipe = (minSwipeDistance: number = 50): SwipeResult => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setDirection(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > minSwipeDistance) {
        setDirection(distanceX > 0 ? 'left' : 'right');
      }
    } else {
      if (Math.abs(distanceY) > minSwipeDistance) {
        setDirection(distanceY > 0 ? 'up' : 'down');
      }
    }
  };

  return {
    direction,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
};
