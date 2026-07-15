"use client";
import { useState } from "react";
import { Menu } from "./icons";

export function Brand() {
  return <a href="#top" className="flex items-center gap-2.5 font-bold text-ink" aria-label="Bridge home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2D78AF] text-lg text-white">b</span><span className="text-xl tracking-tight">bridge</span></a>;
}

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const links = ["How it works", "For partners", "About us"];
  return <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
    <Brand />
    <nav className="hidden items-center gap-8 text-sm font-medium text-[#52708B] md:flex">{links.map((link) => <a key={link} className="transition hover:text-[#226391]" href={`#${link.toLowerCase().replaceAll(" ", "-")}`}>{link}</a>)}</nav>
    <div className="hidden items-center gap-4 md:flex"><a className="text-sm font-semibold text-[#296D9E]" href="#signin">Sign in</a><a className="rounded-full bg-[#1F6D9F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#175982]" href="/tell-your-story">Get started</a></div>
    <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-[#286B9B] md:hidden" aria-label="Toggle navigation"><Menu className="h-6 w-6" /></button>
    {open && <div className="absolute left-5 right-5 top-[70px] rounded-2xl bg-white p-5 shadow-soft md:hidden"><div className="flex flex-col gap-4 text-sm font-medium text-[#52708B]">{links.map((link) => <a key={link} href={`#${link.toLowerCase().replaceAll(" ", "-")}`}>{link}</a>)}<a className="rounded-full bg-[#1F6D9F] px-5 py-2.5 text-center font-semibold text-white" href="/tell-your-story">Get started</a></div></div>}
  </header>;
}
