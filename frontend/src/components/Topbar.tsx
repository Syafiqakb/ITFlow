import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notifications";

function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
  });

  const { data: notificationsResponse, isLoading: isNotificationsLoading } =
    useQuery({
      queryKey: ["notifications"],
      queryFn: () => getNotifications(1),
      enabled: isOpen,
    });

  const notifications = notificationsResponse?.data ?? [];

  const handleNotificationClick = async (
    notificationId: number,
    ticketId: number | null,
  ) => {
    try {
      await markNotificationAsRead(notificationId);

      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });

      setIsOpen(false);

      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      }
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    } catch (error) {
      console.error("Unable to mark notifications as read:", error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <p className="text-sm text-gray-500">Welcome back</p>
        <h2 className="text-lg font-semibold text-gray-900">IT Service Desk</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-medium text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 z-50 mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications
                  </h3>

                  <p className="text-xs text-gray-500">{unreadCount} unread</p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-gray-700 hover:text-gray-900"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isNotificationsLoading ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No notifications.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification.id,
                          notification.ticket_id,
                        )
                      }
                      className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                        notification.is_read ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            notification.is_read ? "bg-gray-300" : "bg-red-500"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>

                          {notification.ticket && (
                            <p className="mt-1 text-xs text-gray-500">
                              {notification.ticket.ticket_number} ·{" "}
                              {notification.ticket.title}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
            JD
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">IT Support</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
