import { useState, useEffect } from 'react';

export function useRateLockTimer(initialSeconds = 30) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : initialSeconds));
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds]);

  return secondsRemaining;
}
