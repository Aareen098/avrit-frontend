import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { askAssistant } from "@/api/assistant.api";
import Icon from "@/components/common/Icon";
import ScoreBadge from "@/components/common/ScoreBadge";
import StageBadge from "@/components/common/StageBadge";
import { cn } from "@/utils/cn";

const SUGGESTIONS = ["Show me the top candidates", "Who knows Java?", "Who has React skills?", "Who is in interviews?"];
const WELCOME = { role: "assistant", text: "Hi! Ask me about your candidates. I search their CVs and rank them against your jobs.", candidates: [] };

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setBusy(true);
    try {
      const res = await askAssistant(message);
      setMessages((m) => [...m, { role: "assistant", text: res.answer, candidates: res.candidates || [] }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I could not reach the assistant. Please try again.", candidates: [] }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Icon name="auto_awesome" filled className="text-primary-container" /> AI Assistant
        </h1>
        <p className="mt-1 text-slate-500">Ask questions about your candidates in plain English.</p>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-card" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary-container text-white" : "bg-slate-100 text-on-surface")}>
              <p>{m.text}</p>
              {m.candidates?.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {m.candidates.map((c) => (
                    <li key={c.id}>
                      <Link to={`/candidates/${c.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-on-surface hover:border-slate-300">
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.job}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreBadge score={c.aiScore} />
                          <StageBadge stage={c.stage} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">Thinking...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} disabled={busy} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your candidates..."
          aria-label="Message"
          className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container text-white hover:bg-primary disabled:opacity-50">
          <Icon name="send" className="text-xl" />
        </button>
      </form>
    </div>
  );
}