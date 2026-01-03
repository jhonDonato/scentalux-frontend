"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';

export function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = format(currentTime, 'HH:mm:ss');

  return (
    <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-muted px-3 py-1.5 rounded-md">
      <Clock className="h-4 w-4" />
      <span>{formattedTime}</span>
    </div>
  );
}
