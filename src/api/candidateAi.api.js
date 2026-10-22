import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";

// All three use the ONE resume saved on the candidate's profile, and can take up to a minute.
const wait = (ms = 1500) => new Promise((r) => setTimeout(r, ms));

// Real API: POST /me/ai/resume-feedback -> { score, summary, strengths[], improvements[], missingSections[] }
export async function getResumeFeedback() {
  if (USE_MOCK) {
    await wait();
    return {
      score: 68,
      summary: "A solid resume with clear projects, but it needs measurable results and a skills section.",
      strengths: ["Clear project descriptions", "Relevant tech stack"],
      improvements: ["Add numbers to your achievements", "Group your skills in one section", "Shorten the summary to two lines"],
      missingSections: ["Skills", "Contact links"],
    };
  }
  return (await api.post("/me/ai/resume-feedback")).data;
}

// Real API: POST /me/ai/best-matches -> [{ jobId, title, company, location, type, score, reason, missing[] }]  (best first)
export async function getBestMatches() {
  if (USE_MOCK) {
    await wait();
    return [
      { jobId: 1, title: "Senior Frontend Engineer", company: "Acme Technologies", location: "Remote", type: "Full-time", score: 82, reason: "Strong React and TypeScript work.", missing: ["Testing"] },
      { jobId: 2, title: "Backend Engineer (Java)", company: "Acme Technologies", location: "Bengaluru", type: "Full-time", score: 55, reason: "Some Java, little backend depth.", missing: ["Kafka", "AWS"] },
    ];
  }
  return (await api.post("/me/ai/best-matches")).data;
}

// Real API: POST /me/ai/job-match { jobId } -> { score, verdict, matched[], missing[], tips[] }
export async function getJobMatch(jobId) {
  if (USE_MOCK) {
    await wait();
    return { score: 74, verdict: "A good fit, with a couple of gaps.", matched: ["React", "JavaScript"], missing: ["Testing"], tips: ["Mention any testing you have done."] };
  }
  return (await api.post("/me/ai/job-match", { jobId })).data;
}

// The server sends { message }; this reads it.
export const aiError = (err) => err?.response?.data?.message || "Something went wrong. Please try again.";