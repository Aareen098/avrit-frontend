import api from "@/api/axios";

// Admin only. GET /usage -> { plan, now, history, invoices } for the logged-in admin's own company.
export const getCompanyUsage = async () => (await api.get("/usage")).data;