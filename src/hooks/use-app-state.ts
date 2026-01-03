"use client";

// This hook is no longer in use as the state is managed by individual components fetching from the API.
// It is kept for reference but can be safely removed.

import { useContext } from 'react';
// import { RestaurantContext } from '@/providers/restaurant-state-provider';

export const useAppState = () => {
  // const context = useContext(RestaurantContext);
  // if (context === undefined) {
  //   throw new Error('useAppState must be used within a RestaurantProvider');
  // }
  // return context;
  console.warn("useAppState is deprecated and should not be used.");
  return {};
};
