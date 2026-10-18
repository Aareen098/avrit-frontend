import api from "@/api/axios";
import { USE_MOCK } from "@/api/auth.api";
import { getCandidates } from "@/api/candidates.api";

const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));
const pick = (c) => ({ id: c.id, name: c.name, job: c.job, aiScore: c.aiScore, stage: c.stage });

// Real API: POST /assistant/chat { message } -> { answer: "text", candidates: [{id,name,job,aiScore,stage}] }
// Your RAG + LLM backend answers here, using the CVs and jobs it has stored.
export async function askAssistant(message) {
  if (!USE_MOCK) return (await api.post("/assistant/chat", { message })).data;

  await wait();
  const all = await getCandidates();
  const q = message.toLowerCase();

  const skill = [...new Set(all.flatMap((c) => c.skills))].find((s) => q.includes(s.toLowerCase()));
  if (skill) {
    const found = all.filter((c) => c.skills.some((s) => s.toLowerCase() === skill.toLowerCase())).sort((a, b) => b.aiScore - a.aiScore);
    return { answer: `${found.length} candidate${found.length === 1 ? " has" : "s have"} ${skill} on their CV. Best match first:`, candidates: found.map(pick) };
  }
  if (/(top|best|strong|shortlist)/.test(q)) {
    const top = [...all].filter((c) => c.stage !== "REJECTED").sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);
    return { answer: "Here are the three strongest matches right now:", candidates: top.map(pick) };
  }
  if (/(interview)/.test(q)) {
    const list = all.filter((c) => c.stage === "INTERVIEW");
    return { answer: list.length ? "These candidates are at the interview stage:" : "Nobody is at the interview stage yet.", candidates: list.map(pick) };
  }
  return { answer: "I can search CVs by skill (try \"who knows Java?\"), show your top candidates, or list people in interviews. This is a demo answer until the AI backend is connected.", candidates: [] };
}