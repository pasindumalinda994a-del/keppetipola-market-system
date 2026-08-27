"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchNotifications, markNotificationsRead } from "@/lib/api";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { NotificationItem } from "@/types";

type NotificationState = {
  notifications: NotificationItem[];
  unread: number;
};

export function useNotifications() {
  const { token } = useAuth();
  const { data, setData, loading, refetch } = useTokenQuery<NotificationState>(
    token,
    async (authToken) => {
      const result = await fetchNotifications(authToken);
      return { notifications: result.notifications, unread: result.unread };
    },
    { notifications: [], unread: 0 }
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    await markNotificationsRead(token);
    setData((prev) => ({
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      unread: 0,
    }));
  }, [token, setData]);

  return {
    notifications: data.notifications,
    unread: data.unread,
    loading,
    refetch,
    markAllRead,
  };
}
