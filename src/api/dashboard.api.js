import api from "@/api/axios";

// GET /dashboard -> the company's hiring numbers, already added up by the server.
export const getDashboardSummary = async () => (await api.get("/dashboard")).data;