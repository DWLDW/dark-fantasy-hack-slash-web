import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for continuous rapid action execution when holding down a button (mouse/touch).
 * Bulletproof against unmounting, pointer loss, and point exhaustion.
 */
export function useHoldAction(
  action: (e?: React.SyntheticEvent) => void,
  initialDelay = 280,
  repeatInterval = 60,
  enabled = true
) {
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount or when enabled state changes to false
  useEffect(() => {
    if (!enabled) {
      stop();
    }
    return () => {
      stop();
    };
  }, [enabled, stop]);

  const start = useCallback((e?: React.SyntheticEvent) => {
    if (!enabledRef.current) return;
    if (e) {
      e.stopPropagation();
    }
    stop();
    actionRef.current(e);

    const handleGlobalUp = () => {
      stop();
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('touchcancel', handleGlobalUp);
    };

    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    window.addEventListener('touchcancel', handleGlobalUp);

    timerRef.current = window.setTimeout(() => {
      if (!enabledRef.current) {
        stop();
        return;
      }
      intervalRef.current = window.setInterval(() => {
        if (!enabledRef.current) {
          stop();
          return;
        }
        actionRef.current(e);
      }, repeatInterval);
    }, initialDelay);
  }, [stop, initialDelay, repeatInterval]);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchCancel: stop
  };
}
