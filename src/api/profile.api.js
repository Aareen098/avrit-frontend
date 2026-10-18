import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// Real API: GET /me/profile and PUT /me/profile (multipart if a new resume is attached)
// Profile shape: { name, phone, location, about, resumeName }
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const keyFor = (email) => `hireflow-mock-profile-${String(email).toLowerCase()}`;

export async function getProfile(user) {
  if (USE_MOCK) {
    await wait(250);
    try {
      return JSON.parse(localStorage.getItem(keyFor(user.email))) || { name: user.name, phone: "", location: "", about: "", resumeName: "" };
    } catch {
      return { name: user.name, phone: "", location: "", about: "", resumeName: "" };
    }
  }
  return (await api.get("/me/profile")).data;
}

export async function saveProfile({ user, values, resumeFile }) {
  if (USE_MOCK) {
    await wait();
    const old = await getProfile(user);
    const saved = { ...old, ...values, resumeName: resumeFile ? resumeFile.name : old.resumeName };
    localStorage.setItem(keyFor(user.email), JSON.stringify(saved));
    return saved;
  }
  const form = new FormData();
  Object.entries(values).forEach(([k, v]) => form.append(k, v ?? ""));
  if (resumeFile) form.append("resume", resumeFile);
  return (await api.put("/me/profile", form)).data;
}