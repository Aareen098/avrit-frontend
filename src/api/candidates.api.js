import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// ---- Mock data until the Spring Boot API exists ----
// aiScore (0-100) is for staff only. Never show it to candidates.
const CANDIDATES = [
  { id: 1, name: "Priya Sharma", email: "priya.sharma@example.com", phone: "+91 98765 43210", location: "Bengaluru", job: "Senior Frontend Engineer", stage: "INTERVIEW", aiScore: 92, experience: 6, skills: ["React", "TypeScript", "Tailwind", "Testing"], summary: "Frontend engineer with 6 years building design systems and dashboards. Led a team of four at a fintech startup.", appliedAt: "2026-10-01", resume: "priya-sharma.pdf" },
  { id: 2, name: "Rahul Verma", email: "rahul.verma@example.com", phone: "+91 91234 56780", location: "Hyderabad", job: "Backend Engineer (Java)", stage: "SCREENING", aiScore: 84, experience: 4, skills: ["Java", "Spring Boot", "PostgreSQL", "Docker"], summary: "Backend developer who has shipped REST APIs serving 2M requests a day. Comfortable with CI/CD and Docker.", appliedAt: "2026-10-02", resume: "rahul-verma.pdf" },
  { id: 3, name: "Ananya Iyer", email: "ananya.iyer@example.com", phone: "+91 99887 76655", location: "Remote", job: "Product Designer", stage: "OFFER", aiScore: 88, experience: 5, skills: ["Figma", "Prototyping", "User research"], summary: "Product designer focused on B2B tools. Strong portfolio of end-to-end redesigns with measurable results.", appliedAt: "2026-09-30", resume: "ananya-iyer.pdf" },
  { id: 4, name: "Karan Mehta", email: "karan.mehta@example.com", phone: "+91 90000 11122", location: "Pune", job: "Senior Frontend Engineer", stage: "APPLIED", aiScore: 61, experience: 2, skills: ["JavaScript", "HTML", "CSS"], summary: "Junior developer with two years of experience on marketing sites. Learning React.", appliedAt: "2026-10-05", resume: "karan-mehta.pdf" },
  { id: 5, name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "+91 98111 22334", location: "Hyderabad", job: "Backend Engineer (Java)", stage: "HIRED", aiScore: 90, experience: 7, skills: ["Java", "Kafka", "AWS", "Microservices"], summary: "Senior backend engineer with deep microservices experience. Accepted our offer.", appliedAt: "2026-09-18", resume: "sneha-reddy.pdf" },
  { id: 6, name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+91 97000 33445", location: "Delhi", job: "Product Designer", stage: "REJECTED", aiScore: 48, experience: 1, skills: ["Photoshop", "Canva"], summary: "Graphic designer moving into product design. Limited UX experience so far.", appliedAt: "2026-09-25", resume: "vikram-singh.pdf" },
  { id: 7, name: "Meera Nair", email: "meera.nair@example.com", phone: "+91 98450 55667", location: "Kochi", job: "Senior Frontend Engineer", stage: "SCREENING", aiScore: 76, experience: 3, skills: ["React", "Redux", "Jest"], summary: "Mid-level React developer with solid testing habits and good communication.", appliedAt: "2026-10-03", resume: "meera-nair.pdf" },
];
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// Stage changes made in the pipeline are remembered in the browser (mock only).
const KEY = "avrit-mock-stages";
const readStages = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};
// What each job asks for. In the real app the backend compares the CV with the job description.
const JOB_SKILLS = {
  "Senior Frontend Engineer": ["React", "TypeScript", "Tailwind", "Testing"],
  "Backend Engineer (Java)": ["Java", "Spring Boot", "PostgreSQL", "Docker"],
  "Product Designer": ["Figma", "Prototyping", "User research"],
};
const norm = (s) => s.toLowerCase();

// Real API returns this inside GET /candidates/:id as:
// match: { matched: [...], missing: [...], reasons: [...] } and resumeText (or resumeUrl for a PDF preview)
function withMatch(c) {
  const required = JOB_SKILLS[c.job] || [];
  const have = c.skills.map(norm);
  const matched = required.filter((r) => have.includes(norm(r)));
  const missing = required.filter((r) => !have.includes(norm(r)));
  const reasons = [
    `Matches ${matched.length} of ${required.length} required skills`,
    c.experience >= 4 ? `${c.experience} years of experience is a strong fit` : `${c.experience} years of experience is on the lower side`,
  ];
  if (c.aiScore >= 85) reasons.push("Overall profile is one of the closest to this role");
  const resumeText = `${c.name.toUpperCase()}\n${c.location} · ${c.email} · ${c.phone}\n\nSUMMARY\n${c.summary}\n\nSKILLS\n${c.skills.join(", ")}\n\nEXPERIENCE\n${c.experience} years of professional experience.`;
  return { ...c, match: { matched, missing, reasons }, resumeText };
}

// More mock storage: rejection reasons and candidates added by hand.
const REASON_KEY = "avrit-mock-reasons";
const ADDED_KEY = "avrit-mock-added-candidates";
const readObject = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
};
const readAdded = () => {
  try {
    return JSON.parse(localStorage.getItem(ADDED_KEY)) || [];
  } catch {
    return [];
  }
};

const withStages = () => {
  const saved = readStages();
  const reasons = readObject(REASON_KEY);
  return [...readAdded(), ...CANDIDATES].map((c) => ({ ...c, stage: saved[c.id] || c.stage, rejectionReason: reasons[c.id] }));
};

// Real API: GET /candidates -> same fields as above
export async function getCandidates() {
  if (USE_MOCK) {
    await wait();
    return withStages();
  }
  return (await api.get("/candidates")).data;
}

// Real API: GET /candidates/:id
export async function getCandidate(id) {
  if (USE_MOCK) {
    await wait(300);
    const c = withStages().find((x) => String(x.id) === String(id));
    if (!c) throw new Error("Candidate not found");
    return withMatch(c);
  }
  return (await api.get(`/candidates/${id}`)).data;
}

// Real API: PATCH /candidates/:id/stage  { "stage": "REJECTED", "reason": "...", "note": "..." }
export async function updateCandidateStage({ id, stage, reason, note }) {
  if (USE_MOCK) {
    await wait(200);
    localStorage.setItem(KEY, JSON.stringify({ ...readStages(), [id]: stage }));
    const reasons = readObject(REASON_KEY);
    if (stage === "REJECTED" && reason) reasons[id] = reason;
    else delete reasons[id];
    localStorage.setItem(REASON_KEY, JSON.stringify(reasons));
    return { id, stage };
  }
  return (await api.patch(`/candidates/${id}/stage`, { stage, reason, note })).data;
}

// Real API: POST /candidates (multipart: name, email, phone, job, experience, skills, resume).
// The backend reads the CV and works out aiScore. Here we make a rough guess so the demo looks right.
export async function addCandidate({ name, email, phone, job, experience, skills, resume }) {
  if (USE_MOCK) {
    await wait(500);
    const required = JOB_SKILLS[job];
    const have = skills.map(norm);
    const ratio = required ? required.filter((r) => have.includes(norm(r))).length / required.length : 0.5;
    const candidate = {
      id: Date.now(),
      name,
      email,
      phone: phone || "-",
      location: "-",
      job,
      stage: "APPLIED",
      aiScore: Math.round(ratio * 70 + (Math.min(experience, 8) / 8) * 30),
      experience,
      skills,
      summary: "Added manually by the hiring team.",
      appliedAt: new Date().toISOString().slice(0, 10),
      resume: resume ? resume.name : "manual-entry",
    };
    localStorage.setItem(ADDED_KEY, JSON.stringify([candidate, ...readAdded()]));
    return candidate;
  }
  const form = new FormData();
  Object.entries({ name, email, phone, job, experience }).forEach(([k, v]) => form.append(k, v ?? ""));
  form.append("skills", skills.join(","));
  if (resume) form.append("resume", resume);
  return (await api.post("/candidates", form)).data;
}

// Real API: GET /candidates/:id/resume (needs the login token, so it is fetched as a file)
export async function downloadResume(id, fileName = "resume") {
  const res = await api.get(`/candidates/${id}/resume`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// Real API: POST /candidates/:id/ai-evaluate -> the same candidate with the AI score and "why" filled in
export async function runAiAnalysis(id) {
  if (USE_MOCK) {
    await wait(800);
    return getCandidate(id);
  }
  return (await api.post(`/candidates/${id}/ai-evaluate`)).data;
}