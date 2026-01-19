import { useEffect, useRef } from "react";

export function useInactivity(timeoutMs, onInactive) {
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(onInactive, timeoutMs);
  };
  const handleActivity = () => resetTimer();
  useEffect(() => {
    resetTimer(); // Start timer
    console.log("useInactivity hook");
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  });
}
