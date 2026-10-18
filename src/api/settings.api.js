import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// ---- Mock settings, kept in the browser ----
const KEY = "hireflow-mock-settings";
const DEFAULTS = {
  company: { name: "Acme Technologies", website: "https://acme.example.com", contactEmail: "careers@acme.example.com" },
  ai: { shortlistThreshold: 80, showExplanation: true },
  team: [
    { id: 1, name: "Admin User", email: "admin@hireflow.com", role: "ADMIN" },
    { id: 2, name: "Riya Kapoor", email: "riya@acme.example.com", role: "RECRUITER" },
    { id: 3, name: "Arjun Rao", email: "arjun@acme.example.com", role: "HIRING_MANAGER" },
  ],
};
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const read = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return DEFAULTS;
  }
};
const write = (patch) => localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch }));

// Real API: GET /settings -> { company, ai, team }
export async function getSettings() {
  if (USE_MOCK) {
    await wait(250);
    return read();
  }
  return (await api.get("/settings")).data;
}

// Real API: PUT /settings/company, PUT /settings/ai, POST /settings/team/invite
export async function saveCompany(company) {
  if (USE_MOCK) {
    await wait();
    write({ company });
    return company;
  }
  return (await api.put("/settings/company", company)).data;
}

export async function saveAi(ai) {
  if (USE_MOCK) {
    await wait();
    write({ ai });
    return ai;
  }
  return (await api.put("/settings/ai", ai)).data;
}

export async function inviteMember({ email, role }) {
  if (USE_MOCK) {
    await wait();
    const team = [...read().team, { id: Date.now(), name: email.split("@")[0], email, role }];
    write({ team });
    return team;
  }
  return (await api.post("/settings/team/invite", { email, role })).data;
}