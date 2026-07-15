"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import { Check } from "@/components/icons";

const versionMeta = { "Clear English Version": { key: "clear", eyebrow: "Clear, neutral English" }, "NGO Support Version": { key: "ngo", eyebrow: "NGO support version" }, "Professional Version": { key: "professional", eyebrow: "Professional version" } } as const;
type VersionName = keyof typeof versionMeta;
type GeneratedVersions = Record<"clear" | "ngo" | "professional", string>;

export default function ResultsPage() {
  const [active, setActive] = useState<VersionName>("Clear English Version");
  const [original, setOriginal] = useState("");
  const [versions, setVersions] = useState<GeneratedVersions | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState("");

  useEffect(() => { setOriginal(window.localStorage.getItem("bridge-original-story") || "Your original story will appear here."); const stored = window.localStorage.getItem("bridge-ai-versions"); if (stored) { try { setVersions(JSON.parse(stored)); } catch { setVersions(null); } } }, []);
  const generatedText = versions?.[versionMeta[active].key] || "Your generated version will appear here after Bridge has processed your story.";
  useEffect(() => { setEdited(generatedText); setEditing(false); }, [active, generatedText]);

  const text = editing ? edited : generatedText;
  async function copyVersion() { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  function downloadVersion() { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); link.download = "bridge-english-version.txt"; link.click(); URL.revokeObjectURL(link.href); }

  return <main className="min-h-screen bg-mist"><div className="border-b border-[#DCEBF5] bg-white"><Navigation /></div>
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 lg:px-8 lg:pt-20"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#4385B2]">Your English version</p><h1 className="serif mt-3 text-5xl tracking-tight text-ink sm:text-6xl">Your story, made clear.</h1><p className="mt-5 text-lg leading-relaxed text-[#627F97]">Bridge has shaped your words into clear English while keeping your voice at the center.</p></div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2"><StoryPanel title="Original Story" label="Your words" className="bg-white"><p className="whitespace-pre-wrap text-[15px] leading-7 text-[#456982]">{original}</p></StoryPanel><StoryPanel title="AI English Version" label={versionMeta[active].eyebrow} className="border-[#BDE2F8] bg-[#F2FAFF]"><p className="whitespace-pre-wrap text-[15px] leading-7 text-[#315B78]">{generatedText}</p><div className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#2775A7]"><Check className="h-5 w-5" />Authentic voice preserved</div></StoryPanel></div>
      <section className="mt-10 rounded-3xl bg-white p-5 shadow-soft sm:p-8"><div className="flex flex-col gap-4 border-b border-[#E0EDF6] pb-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-ink">Choose a version</h2><p className="mt-1 text-sm text-[#627F97]">Adapt your story for the opportunity ahead.</p></div><span className="rounded-full bg-[#E5F5FF] px-3 py-1.5 text-xs font-bold text-[#367DAC]">Mock AI output</span></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{(Object.keys(versionMeta) as VersionName[]).map((name) => <button key={name} onClick={() => setActive(name)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition ${active === name ? "bg-[#1F6D9F] text-white" : "bg-[#F1F7FB] text-[#53728A] hover:bg-[#E3F2FB]"}`}>{name}</button>)}</div>
        <div className="mt-6 rounded-2xl bg-[#F8FCFF] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#76A5C4]">{versionMeta[active].eyebrow}</p>{editing ? <textarea value={edited} onChange={(event) => setEdited(event.target.value)} className="mt-4 min-h-48 w-full resize-y rounded-xl border border-[#CBE4F5] bg-white p-4 leading-7 text-[#315B78] outline-none focus:ring-4 focus:ring-[#E3F4FF]"/> : <p className="mt-4 whitespace-pre-wrap leading-7 text-[#315B78]">{generatedText}</p>}</div>
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={copyVersion} className="rounded-full border border-[#BBD9EC] bg-white px-5 py-2.5 text-sm font-bold text-[#286B9B]">{copied ? "Copied!" : "Copy"}</button><button onClick={downloadVersion} className="rounded-full border border-[#BBD9EC] bg-white px-5 py-2.5 text-sm font-bold text-[#286B9B]">Download</button><button onClick={() => setEditing(!editing)} className="rounded-full bg-[#1F6D9F] px-5 py-2.5 text-sm font-bold text-white">{editing ? "Save edits" : "Edit"}</button></div>
      </section>
    </section>
  </main>;
}

function StoryPanel({ title, label, className, children }: { title: string; label: string; className: string; children: React.ReactNode }) { return <article className={`rounded-3xl border p-6 shadow-soft sm:p-8 ${className}`}><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold text-ink">{title}</h2><span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#5F8EAC]">{label}</span></div><div className="mt-7">{children}</div></article>; }
