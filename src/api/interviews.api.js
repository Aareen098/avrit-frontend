import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";
import { updateCandidateStage } from "@/api/candidates.api";

// ---- Mock interviews, kept in the browser ----
const KEY = "hireflow-mock-interviews";
const dayFromToday = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const TODAY = dayFromToday(0);
const SEED = [
  { id: 1, candidateId: 1, candidateName: "Priya Sharma", job: "Senior Frontend Engineer", date: dayFromToday(2), time: "11:00", type: "Video call", interviewer: "Arjun Rao", notes: "Second round: system design." },
  { id: 2, candidateId: 3, candidateName: "Ananya Iyer", job: "Product Designer", date: dayFromToday(5), time: "15:30", type: "On-site", interviewer: "Riya Kapoor", notes: "" },
  { id: 3, candidateId: 5, candidateName: "Sneha Reddy", job: "Backend Engineer (Java)", date: dayFromToday(-4), time: "10:00", type: "Video call", interviewer: "Arjun Rao", notes: "Went well." },
];
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || SEED;
  } catch {
    return SEED;
  }
};

// Real API: GET /interviews -> [{ id, candidateId, candidateName, job, date: "2026-10-12", time: "11:00", type, interviewer, notes }]
export async function getInterviews() {
  if (USE_MOCK) {
    await wait();
    return read();
  }
  return (await api.get("/interviews")).data;
}

// Real API: POST /interviews { candidateId, date, time, type, interviewer, notes }
// The backend should also move the candidate to the Interview stage and email them.
export async function scheduleInterview(data) {
  if (USE_MOCK) {
    await wait(500);
    const interview = { ...data, id: Date.now() };
    localStorage.setItem(KEY, JSON.stringify([interview, ...read()]));
    await updateCandidateStage({ id: data.candidateId, stage: "INTERVIEW" });
    return interview;
  }
  return (await api.post("/interviews", data)).data;
}