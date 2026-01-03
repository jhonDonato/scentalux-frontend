
"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ScrollToSection() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sectionId = searchParams.get('section');
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        // Use a timeout to ensure the element is rendered and ready.
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [searchParams]);

  return null;
}
