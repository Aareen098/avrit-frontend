import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// Real API (needs login, every role):
// GET  /notifications              -> [{ id, kind, title, body, link, createdAt, read }]  (latest 30)
// GET  /notifications/unread-count -> { count }
// POST /notifications/{id}/read    -> 204
// POST /notifications/read-all     -> 204
// Mock mode has no notifications.
export async function getNotifications() {
  if (USE_MOCK) return [];
  return (await api.get("/notifications")).data;
}

export async function getUnreadCount() {
  if (USE_MOCK) return 0;
  return (await api.get("/notifications/unread-count")).data.count;
}

export async function markNotificationRead(id) {
  if (!USE_MOCK) await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  if (!USE_MOCK) await api.post("/notifications/read-all");
}