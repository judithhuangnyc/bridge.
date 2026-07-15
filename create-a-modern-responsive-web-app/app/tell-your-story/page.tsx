"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { ArrowRight, Check } from "@/components/icons";

type ImagePreview = { name: string; src: string };

const helpOptions = [
  "Scholarship",
  "University application",
  "Employment",
  "NGO support",
  "Personal statement",
  "General storytelling",
];

export default function TellYourStoryPage() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [videoName, setVideoName] = useState("");
  const [need, setNeed] = useState("");
  const [imageDragging, setImageDragging] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  function addImages(files: FileList | null) {
    if (!files) return;
    const validFiles = Array.from(files).filter((file) => ["image/jpeg", "image/png"].includes(file.type));
    setImages((current) => [...current, ...validFiles.map((file) => ({ name: file.name, src: URL.createObjectURL(file) }))]);
  }

  function addVideo(files: FileList | null) {
    const video = files?.[0];
    if (video?.type === "video/mp4") setVideoName(video.name);
  }

  function preventDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); }

  async function generateVersion() {
    if (story.trim().length < 10) { setError("Please write at least a few sentences so Bridge can help."); return; }
    setGenerating(true); setError("");
    try {
      const response = await fetch("/.netlify/functions/generate-story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ story, purpose: need }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      // Result text stays on this device until Supabase storage is added.
      window.localStorage.setItem("bridge-original-story", story);
      window.localStorage.setItem("bridge-ai-versions", JSON.stringify(data.versions));
      router.push("/results/");
    } catch (fetchError) { setError(fetchError instanceof Error ? fetchError.message : "Bridge could not create a version right now."); }
    finally { setGenerating(false); }
  }

  return <main className="min-h-screen bg-mist">
    <div className="border-b border-[#DCEBF5] bg-white"><Navigation /></div>
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-14 sm:pt-20">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#4385B2]">Your space, your pace</p>
        <h1 className="serif mt-3 text-5xl tracking-tight text-ink sm:text-6xl">Tell Your Story</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#627F97]">Upload or write about your experiences. Bridge uses AI to transform your story into clear English while preserving your authentic voice.</p>
      </div>

      <div className="mt-12 space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <OptionHeading number="01" title="Write your story" description="There is no right way to begin. Write in any language that feels comfortable." />
          <label className="sr-only" htmlFor="story">Describe your experiences</label>
          <textarea id="story" value={story} onChange={(event) => setStory(event.target.value)} placeholder="Describe your experiences..." className="mt-6 min-h-48 w-full resize-y rounded-2xl border border-[#D5E8F5] bg-[#FBFDFF] p-5 text-base leading-relaxed text-ink outline-none transition placeholder:text-[#9BB1C2] focus:border-[#67A9D4] focus:ring-4 focus:ring-[#E3F4FF]" />
          <p className="mt-3 text-right text-xs text-[#8AA1B3]">{story.length.toLocaleString()} characters</p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <OptionHeading number="02" title="Upload images" description="Add photos of handwritten notes, documents, or moments you want to share." />
          <div onDragEnter={() => setImageDragging(true)} onDragLeave={() => setImageDragging(false)} onDragOver={preventDrop} onDrop={(event) => { preventDrop(event); setImageDragging(false); addImages(event.dataTransfer.files); }} onClick={() => imageInput.current?.click()} className={`mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${imageDragging ? "border-[#2D80B6] bg-[#F0F9FF]" : "border-[#CDE4F4] bg-[#FBFDFF] hover:border-[#86BCE0]"}`}>
            <UploadIcon /><p className="mt-3 font-semibold text-[#33617F]">Drop JPG or PNG files here</p><p className="mt-1 text-sm text-[#7E99AC]">or <span className="font-semibold text-[#2D80B6]">browse from your device</span></p>
            <input ref={imageInput} onChange={(event: ChangeEvent<HTMLInputElement>) => addImages(event.target.files)} className="hidden" type="file" accept="image/jpeg,image/png" multiple />
          </div>
          {images.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={`${image.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-[#DCEBF5] bg-sky"><img alt={image.name} src={image.src} className="h-full w-full object-cover"/><button onClick={() => setImages((current) => current.filter((_, i) => i !== index))} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-[#54758C] shadow-sm" aria-label={`Remove ${image.name}`}>×</button></div>)}</div>}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <OptionHeading number="03" title="Upload video" description="Share a video in your own words. We’ll help you shape it into an English story." />
          <div onDragEnter={() => setVideoDragging(true)} onDragLeave={() => setVideoDragging(false)} onDragOver={preventDrop} onDrop={(event) => { preventDrop(event); setVideoDragging(false); addVideo(event.dataTransfer.files); }} onClick={() => videoInput.current?.click()} className={`mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${videoDragging ? "border-[#2D80B6] bg-[#F0F9FF]" : "border-[#CDE4F4] bg-[#FBFDFF] hover:border-[#86BCE0]"}`}>
            {videoName ? <><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#DCF2E5] text-[#367B55]"><Check className="h-5 w-5" /></span><p className="mt-3 font-semibold text-[#33617F]">{videoName}</p><p className="mt-1 text-sm text-[#7E99AC]">Video ready to upload</p></> : <><VideoIcon /><p className="mt-3 font-semibold text-[#33617F]">Drop an MP4 video here</p><p className="mt-1 text-sm text-[#7E99AC]">Up to 8 minutes · or <span className="font-semibold text-[#2D80B6]">browse from your device</span></p></>}
            <input ref={videoInput} onChange={(event: ChangeEvent<HTMLInputElement>) => addVideo(event.target.files)} className="hidden" type="file" accept="video/mp4" />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8"><label htmlFor="need" className="text-xl font-bold text-ink">What do you need help with?</label><p className="mt-2 text-[#627F97]">This helps Bridge tailor your English version.</p><select id="need" value={need} onChange={(event) => setNeed(event.target.value)} className="mt-5 w-full appearance-none rounded-xl border border-[#D5E8F5] bg-[#FBFDFF] px-5 py-4 text-base text-[#52708B] outline-none focus:border-[#67A9D4] focus:ring-4 focus:ring-[#E3F4FF]"><option value="" disabled>Select one option</option>{helpOptions.map((option) => <option key={option}>{option}</option>)}</select></section>
        {error && <p role="alert" className="rounded-xl bg-[#FFF0F0] px-4 py-3 text-center text-sm font-medium text-[#A34B4B]">{error}</p>}
        <button onClick={generateVersion} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1F6D9F] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#175982] disabled:cursor-wait disabled:opacity-70">{generating ? "Creating your English versions…" : <>Generate English Version <ArrowRight className="h-5 w-5" /></>}</button>
        <p className="text-center text-xs leading-relaxed text-[#8AA1B3]">Your story is private and stays in your control. We’ll never share it without your permission.</p>
      </div>
    </section>
  </main>;
}

function OptionHeading({ number, title, description }: { number: string; title: string; description: string }) { return <div><span className="text-sm font-bold text-[#73ADD2]">{number}</span><h2 className="mt-2 text-xl font-bold text-ink">{title}</h2><p className="mt-1 text-[#627F97]">{description}</p></div>; }
function UploadIcon() { return <svg className="mx-auto h-10 w-10 text-[#62A8D2]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>; }
function VideoIcon() { return <svg className="mx-auto h-10 w-10 text-[#62A8D2]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><rect x="3" y="6" width="12" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="m15 10 5-3v10l-5-3v-4Z" /></svg>; }
