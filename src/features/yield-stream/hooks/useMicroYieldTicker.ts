import { useState, useEffect, useCallback } from 'react';

export function useMicroYieldTicker(depositedAmount: number, apyPercent: number, initialYield = 0) {
  const [liveAccrued, setLiveAccrued] = useState(initialYield);

  useEffect(() => {
    // Annual yield per millisecond
    const annualUsd = depositedAmount * (apyPercent / 100);
    const msInYear = 365 * 24 * 60 * 60 * 1000;
    const ratePerMs = annualUsd / msInYear;

    const interval = setInterval(() => {
      setLiveAccrued((prev) => prev + ratePerMs * 50);
    }, 50);

    return () => clearInterval(interval);
  }, [depositedAmount, apyPercent]);

  const resetYield = useCallback(() => {
    setLiveAccrued(0.0001);
  }, []);

  return {
    liveAccrued,
    resetYield,
  };
}
