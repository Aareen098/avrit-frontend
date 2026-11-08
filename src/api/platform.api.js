import api from "@/api/axios";

// All of these need the platform owner login. Usage and billing numbers only (no candidate or applicant data).
export const getOverview = async () => (await api.get("/platform/overview")).data;
export const getCompanies = async () => (await api.get("/platform/companies")).data;
export const getCompany = async (id) => (await api.get(`/platform/companies/${id}`)).data;
export const setSuspended = async (id, suspended) =>
  (await api.patch(`/platform/companies/${id}/suspension`, { suspended })).data;
export const setPlan = async (id, planCode) => (await api.patch(`/platform/companies/${id}/plan`, { planCode })).data;
export const getPlans = async () => (await api.get("/platform/plans")).data;
export const getInvoices = async (period) => (await api.get("/platform/invoices", { params: { period } })).data;
export const generateInvoices = async (period) => (await api.post("/platform/invoices/generate", { period })).data;
export const setInvoiceStatus = async (id, status) => (await api.patch(`/platform/invoices/${id}/status`, { status })).data;

// POST /platform/broadcasts/preview  { audience, target, title, message, inApp, email } -> { audienceLabel, inAppCount, emailCount, emailsLeftToday }
// POST /platform/broadcasts          same body -> the saved history item
// GET  /platform/broadcasts          -> latest 50 sends
export const previewBroadcast = async (body) => (await api.post("/platform/broadcasts/preview", body)).data;
export const sendBroadcast = async (body) => (await api.post("/platform/broadcasts", body)).data;
export const getBroadcasts = async () => (await api.get("/platform/broadcasts")).data;