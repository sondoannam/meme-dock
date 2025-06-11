import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  startSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const useCountdown = ({
  startSeconds,
  onComplete,
  autoStart = true,
}: UseCountdownOptions) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [seconds, setSeconds] = useState(startSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  const reset = useCallback(() => {
    setSeconds(startSeconds);
    setIsActive(false);
  }, [startSeconds]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isActive) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(intervalId as NodeJS.Timeout);
            onCompleteRef.current?.();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive]);

  return {
    seconds,
    isActive,
    start,
    pause,
    reset,
    formattedTime: new Date(seconds * 1000).toISOString().substring(14, 19), // MM:SS format
  };
};
