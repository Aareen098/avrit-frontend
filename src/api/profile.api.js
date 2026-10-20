import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// Real API: GET /me/profile and PUT /me/profile (multipart; "resume" replaces the ONE resume on the profile)
// Profile shape: { name, phone, location, headline, about, linkedin, github, portfolio, resumeName, completeness }
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const keyFor = (email) => `hireflow-mock-profile-${String(email).toLowerCase()}`;
const FIELDS = ["name", "phone", "location", "headline", "about", "linkedin", "github", "portfolio"];

// Same rule as the server: 6 things to fill in.
function withCompleteness(p) {
  const done = [p.phone, p.location, p.headline, p.about, p.linkedin || p.github || p.portfolio, p.resumeName];
  return { ...p, completeness: Math.floor((done.filter(Boolean).length * 100) / done.length) };
}
const empty = (user) => withCompleteness({ name: user.name, phone: "", location: "", headline: "", about: "", linkedin: "", github: "", portfolio: "", resumeName: "" });

export async function getProfile(user) {
  if (USE_MOCK) {
    await wait(250);
    try {
      return withCompleteness({ ...empty(user), ...JSON.parse(localStorage.getItem(keyFor(user.email))) });
    } catch {
      return empty(user);
    }
  }
  return (await api.get("/me/profile")).data;
}

export async function saveProfile({ user, values, resumeFile }) {
  if (USE_MOCK) {
    await wait();
    const old = await getProfile(user);
    const saved = withCompleteness({ ...old, ...values, resumeName: resumeFile ? resumeFile.name : old.resumeName });
    localStorage.setItem(keyFor(user.email), JSON.stringify(saved));
    return saved;
  }
  const form = new FormData();
  FIELDS.forEach((k) => form.append(k, values[k] ?? ""));
  if (resumeFile) form.append("resume", resumeFile);
  return (await api.put("/me/profile", form)).data;
}

// GET /me/profile/resume needs the login token, so it is fetched as a file.
export async function downloadMyResume(fileName = "resume") {
  const res = await api.get("/me/profile/resume", { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}