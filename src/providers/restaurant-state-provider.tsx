
"use client";

// This provider is no longer in use and is deprecated.
// The application state is now fetched and managed by individual components
// via the api layer in /lib/api.ts.
// This file is kept for reference but can be safely removed.

import type { ReactNode } from 'react';
import { createContext } from 'react';

export const RestaurantContext = createContext<undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  console.warn("RestaurantProvider is deprecated and should not be used.");
  return (
    <RestaurantContext.Provider value={undefined}>
      {children}
    </RestaurantContext.Provider>
  );
}
