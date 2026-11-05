import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/common/Icon";
import { cn } from "@/utils/cn";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notifications.api";

const ICONS = {
  NEW_APPLICATION: "person_add",
  AI_MATCH: "auto_awesome",
  INTERVIEW: "event",
  APPLICATION_STAGE: "flag",
  JOB_CLOSED: "lock",
  PLATFORM: "campaign",
};

function timeAgo(iso) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return `${Math.floor(seconds / 86400)} d ago`;
}

// The bell used by staff, candidates and the platform owner. The number is checked every 30 seconds.
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications", "count"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: getNotifications,
    enabled: open,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

  // Close when clicking outside.
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openItem = (n) => {
    if (!n.read) readOne.mutate(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <Icon name="notifications" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button
              onClick={() => readAll.mutate()}
              disabled={unread === 0}
              className="text-xs font-medium text-primary-container hover:underline disabled:cursor-default disabled:text-slate-400 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && <p className="px-4 py-6 text-center text-sm text-slate-500">Loading...</p>}
            {!isLoading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => openItem(n)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50",
                  !n.read && "bg-primary-fixed/20"
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary-container">
                  <Icon name={ICONS[n.kind] || "notifications"} className="text-lg" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", !n.read ? "font-semibold" : "font-medium")}>{n.title}</span>
                  {n.body && <span className="mt-0.5 block text-sm text-slate-600">{n.body}</span>}
                  <span className="mt-1 block text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-container" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}