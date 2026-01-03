"use client";

// This component is no longer used for playing sound.
// Voice notifications are handled in RestaurantStateProvider.
// It is kept for potential future use with simple tones.

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const NotificationSound = ({ play }: { play: boolean }) => {
  const synth = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    // Initialize synth only on client
    if (typeof window !== 'undefined') {
        synth.current = new Tone.Synth().toDestination();
    }
  }, []);

  useEffect(() => {
    if (play && synth.current) {
      Tone.start().then(() => {
        synth.current?.triggerAttackRelease("C5", "8n");
      }).catch(e => console.error("Tone.js start error:", e));
    }
  }, [play]);

  return null;
};

export default NotificationSound;
