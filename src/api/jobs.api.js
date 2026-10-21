import api from "@/api/axios";
import { USE_MOCK, getMockCompanies } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

// ---- Mock data (kept in the browser) until the Spring Boot API exists ----
const KEY = "avrit-mock-jobs";
const SEED = [
  { id: 1, title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time", status: "OPEN", skills: ["React", "TypeScript", "Tailwind"], description: "Build fast, accessible interfaces for our hiring platform. You will own features end to end, work closely with design, and mentor junior engineers.", applicants: 42, createdAt: "2026-09-28" },
  { id: 2, title: "Product Designer", department: "Design", location: "Bengaluru", type: "Full-time", status: "OPEN", skills: ["Figma", "Prototyping", "Research"], description: "Design clear, calm product experiences. You will run user research, build prototypes and ship alongside engineering.", applicants: 18, createdAt: "2026-09-30" },
  { id: 3, title: "Backend Engineer (Java)", department: "Engineering", location: "Hyderabad", type: "Full-time", status: "OPEN", skills: ["Java", "Spring Boot", "PostgreSQL"], description: "Design and build the REST APIs behind our platform. You will care about clean code, testing and performance.", applicants: 31, createdAt: "2026-10-01" },
  { id: 4, title: "Marketing Intern", department: "Marketing", location: "Remote", type: "Internship", status: "DRAFT", applicants: 0, createdAt: "2026-10-03" },
  { id: 5, title: "HR Generalist", department: "People", location: "Pune", type: "Contract", status: "CLOSED", applicants: 64, createdAt: "2026-08-12" },
];
// Jobs saved before companies existed belong to the demo company (id 1).
const companyOf = (job) => job.companyId ?? 1;
const myCompanyId = () => useAuthStore.getState().user?.companyId ?? 1;
const withCompany = (job) => {
  const company = getMockCompanies().find((c) => c.id === companyOf(job));
  return { ...job, companyName: company?.name, companySlug: company?.slug };
};
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || SEED;
  } catch {
    return SEED;
  }
};

// Expected real API: GET /jobs -> [{id,title,department,location,type,status,applicants,createdAt}]
export async function getJobs() {
  if (USE_MOCK) {
    await wait();
    return read().filter((j) => companyOf(j) === myCompanyId());
  }
  return (await api.get("/jobs")).data;
}

// Expected real API: POST /jobs {title,department,location,type,description,skills,status}
export async function createJob(data) {
  if (USE_MOCK) {
    await wait();
    const jobs = read();
    const job = { ...data, id: Date.now(), companyId: myCompanyId(), applicants: 0, createdAt: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(KEY, JSON.stringify([job, ...jobs]));
    return job;
  }
  return (await api.post("/jobs", data)).data;
}

// Public (candidate-facing) versions. Real API: GET /public/jobs and GET /public/jobs/:id
export async function getPublicJobs() {
  if (USE_MOCK) {
    await wait();
    return read().filter((j) => j.status === "OPEN").map(withCompany);
  }
  return (await api.get("/public/jobs")).data;
}

export async function getPublicJob(id) {
  if (USE_MOCK) {
    await wait(300);
    const job = read().find((j) => String(j.id) === String(id) && j.status === "OPEN");
    if (!job) throw new Error("Job not found");
    return withCompany(job);
  }
  return (await api.get(`/public/jobs/${id}`)).data;
}

// One company's careers page. Real API: GET /public/companies/:slug/jobs
//   -> { company: { name, slug }, jobs: [...same fields as /public/jobs] }
export async function getCompanyJobs(slug) {
  if (USE_MOCK) {
    await wait();
    const company = getMockCompanies().find((c) => c.slug === slug);
    if (!company) throw new Error("Company not found");
    const jobs = read()
      .filter((j) => j.status === "OPEN" && companyOf(j) === company.id)
      .map(withCompany);
    return { company: { name: company.name, slug: company.slug }, jobs };
  }
  return (await api.get(`/public/companies/${encodeURIComponent(slug)}/jobs`)).data;
}