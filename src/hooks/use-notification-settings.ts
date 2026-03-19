"use client";

import { useCallback } from "react";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  morningTime: string;
  eveningTime: string;
  setEnabled: (v: boolean) => void;
  setPushEnabled: (v: boolean) => void;
  setMorningTime: (v: string) => void;
  setEveningTime: (v: string) => void;
}

export const useNotificationSettings = create<NotificationSettings>()(
  persist(
    (set) => ({
      enabled: true,
      pushEnabled: false,
      morningTime: "07:30",
      eveningTime: "22:00",
      setEnabled: (enabled) => set({ enabled }),
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      setMorningTime: (morningTime) => set({ morningTime }),
      setEveningTime: (eveningTime) => set({ eveningTime }),
    }),
    {
      name: "hygiene-notify-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useRequestBrowserNotificationPermission() {
  return useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const p = await Notification.requestPermission();
    return p;
  }, []);
}
