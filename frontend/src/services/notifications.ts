import api from "./api";

export interface Notification {
  id: number;
  ticket_id: number | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  ticket?: {
    id: number;
    ticket_number: string;
    title: string;
  } | null;
}

interface NotificationsResponse {
  data: Notification[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface UnreadCountResponse {
  data: {
    count: number;
  };
}

export async function getNotifications(
  page = 1,
): Promise<NotificationsResponse> {
  const response = await api.get<NotificationsResponse>("/notifications", {
    params: {
      page,
    },
  });

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>(
    "/notifications/unread-count",
  );

  return response.data.data.count;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}
