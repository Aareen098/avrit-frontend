import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// ---- Mock storage until the Spring Boot API exists ----
const KEY = "avrit-mock-applications";
const DEMO = { reference: "HF-DEMO01", email: "demo@example.com", jobTitle: "Senior Frontend Engineer", status: "INTERVIEW", appliedAt: "2026-10-01" };
const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [DEMO];
  } catch {
    return [DEMO];
  }
};

// Real API: POST /public/applications (multipart: jobId, name, email, phone, coverNote, resume) -> { reference }
export async function submitApplication({ job, name, email, phone, coverNote, resume }) {
  if (USE_MOCK) {
    await wait();
    const reference = "HF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const app = { reference, email: email.toLowerCase(), jobTitle: job.title, status: "APPLIED", appliedAt: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(KEY, JSON.stringify([app, ...read()]));
    return { reference };
  }
  const form = new FormData();
  form.append("jobId", job.id);
  form.append("name", name);
  form.append("email", email);
  form.append("phone", phone || "");
  form.append("coverNote", coverNote || "");
  form.append("resume", resume);
  return (await api.post("/public/applications", form)).data;
}

// Real API: GET /public/applications/status?reference=..&email=.. -> { jobTitle, status, appliedAt }
// status: APPLIED | IN_REVIEW | INTERVIEW | OFFER | REJECTED. Never return AI scores here.
export async function getApplicationStatus({ reference, email }) {
  if (USE_MOCK) {
    await wait(500);
    const app = read().find((a) => a.reference === reference.trim().toUpperCase() && a.email === email.trim().toLowerCase());
    if (!app) throw new Error("We could not find an application with those details.");
    return app;
  }
  try {
    return (await api.get("/public/applications/status", { params: { reference, email } })).data;
  } catch (err) {
    throw new Error("We could not find an application with those details.", { cause: err });
  }
}


// Real API: GET /me/applications -> [{ reference, jobTitle, status, appliedAt }]  (the logged-in candidate's own)
// Never include AI scores. Mock: two sample applications plus anything applied for with the same email.
const SAMPLES = [
  { reference: "HF-SAMPLE1", jobTitle: "Senior Frontend Engineer", status: "INTERVIEW", appliedAt: "2026-10-01" },
  { reference: "HF-SAMPLE2", jobTitle: "Product Designer", status: "APPLIED", appliedAt: "2026-10-06" },
];
export async function getMyApplications(email) {
  if (USE_MOCK) {
    await wait(400);
    const mine = read().filter((a) => a.email === String(email).toLowerCase());
    return [...mine, ...SAMPLES];
  }
  return (await api.get("/me/applications")).data;
}

// Real API: GET /me/applications/{reference} ->
//   { reference, jobId, jobTitle, company, location, jobType, description, skills, status, appliedAt, coverNote, resumeName }
export async function getMyApplication(reference, email) {
  if (USE_MOCK) {
    const app = (await getMyApplications(email)).find((a) => a.reference === reference);
    if (!app) throw new Error("Application not found");
    return { company: "Acme Technologies", location: "Remote", jobType: "Full-time", description: "Sample job shown in demo mode.", skills: [], coverNote: "", resumeName: "resume.pdf", ...app };
  }
  return (await api.get(`/me/applications/${encodeURIComponent(reference)}`)).data;
}

// Real API: GET /me/interviews -> [{ id, reference, jobTitle, company, date, time, type, interviewer }]
export async function getMyInterviews() {
  if (USE_MOCK) {
    await wait(300);
    const date = new Date(Date.now() + 3 * 864e5).toLocaleDateString("en-CA");
    return [{ id: 1, reference: "HF-SAMPLE1", jobTitle: "Senior Frontend Engineer", company: "Acme Technologies", date, time: "11:00", type: "Video call", interviewer: "Anita Rao" }];
  }
  return (await api.get("/me/interviews")).data;
}

// Real API: POST /me/applications { jobId, coverNote } -> { reference }
// Uses the name, phone and the ONE resume saved on the candidate's profile.
export async function applyWithProfile({ job, email, coverNote }) {
  if (USE_MOCK) return submitApplication({ job, name: "", email, phone: "", coverNote, resume: null });
  return (await api.post("/me/applications", { jobId: job.id, coverNote: coverNote || "" })).data;
}