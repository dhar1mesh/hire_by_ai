"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Mic,
  Video,
  ShieldCheck,
  ArrowRight,
  Database,
  Radio,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  ChevronRight,
  BarChart3,
  Server,
} from "lucide-react";
import { CANDIDATE_RESUME } from "@/lib/resumeData";

export default function HomePage() {
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [hasCamPermission, setHasCamPermission] = useState<boolean | null>(null);
  const [isCheckingDevices, setIsCheckingDevices] = useState(false);

  // Pre-flight media device test
  const testMediaDevices = async () => {
    setIsCheckingDevices(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setHasMicPermission(true);
      setHasCamPermission(true);
      // Immediately stop tracks to release hardware
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.warn("Device test issue:", err);
      // Try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
        setHasCamPermission(false);
        audioStream.getTracks().forEach((t) => t.stop());
      } catch {
        setHasMicPermission(false);
        setHasCamPermission(false);
      }
    } finally {
      setIsCheckingDevices(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Round-0 AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                WebRTC Realtime
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Technical Bar Raiser</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/interview"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
          >
            <span>Launch Interview Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 space-y-12">
        {/* Title and Intro */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sub-Second Latency • Audio-to-Audio Native WebRTC</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Next-Gen Autonomous <br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Round-0 AI Technical Interviewer
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Experience an uncompromising, live voice interview with Sarah Chen, Principal Architect AI.
            Direct browser-to-OpenAI WebRTC streaming guarantees instant conversational interruptions,
            zero server audio lag, and deep probing into your distributed systems resume.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/interview"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02]"
            >
              <span>Enter Interview Stage</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={testMediaDevices}
              disabled={isCheckingDevices}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-colors"
            >
              {isCheckingDevices ? (
                <span>Checking Audio & Camera...</span>
              ) : hasMicPermission === true ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hardware Ready!</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span>Pre-flight Mic & Camera Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-Time Architecture Highlight Box */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Radio className="w-4 h-4" />
            <span>High-Speed Real-Time System Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3">
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-xs font-semibold text-white">Next.js Ephemeral Broker</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                <code className="text-indigo-300 font-mono text-[11px]">/api/session</code> securely mints short-lived
                client credentials from OpenAI, keeping secret keys safe without proxying audio bytes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-3">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-semibold text-white">Direct WebRTC PeerConnection</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Browser connects directly to <code className="text-emerald-300 font-mono text-[11px]">gpt-4o-realtime-preview</code>.
                Opus audio travels peer-to-peer with sub-300ms latency and native interruption handling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-3">
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-semibold text-white">DataChannel Telemetry & ASR</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Whisper-1 transcripts and rolling deltas stream over <code className="text-purple-300 font-mono text-[11px]">RTCDataChannel</code>,
                enabling live rubric tracking and post-call bar-raiser scorecarding.
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Profile Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Candidate Profile Loaded</h2>
              <p className="text-xs text-slate-400">Hardcoded Hackathon Demonstration Profile</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              5 Years Experience
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{CANDIDATE_RESUME.name}</h3>
                <p className="text-xs text-indigo-400 font-medium">{CANDIDATE_RESUME.title}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{CANDIDATE_RESUME.summary}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 max-w-md">
                {CANDIDATE_RESUME.coreStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Two Projects To Probe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CANDIDATE_RESUME.projects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{proj.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                      Target Project
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{proj.summary}</p>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Architectural Focus
                    </span>
                    <ul className="mt-1 space-y-1">
                      {proj.keyArchitecture.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                          <span className="text-indigo-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Rubric Overview */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Bar Raiser Evaluation Rubric</h2>
              <p className="text-xs text-slate-400">Scored automatically upon session completion</p>
            </div>
            <Link
              href="/scorecard"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Preview Sample Scorecard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {CANDIDATE_RESUME.rubric.map((r) => (
              <div key={r.category} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-slate-200">{r.category}</h4>
                  <span className="text-[10px] font-mono text-indigo-400">{Math.round(r.weight * 100)}%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-slate-800/60 bg-slate-950 px-6 flex items-center justify-between text-xs text-slate-500">
        <div>Round-0 AI Interview System • Powered by OpenAI Realtime WebRTC</div>
        <div>Built for Hackathon Demo</div>
      </footer>
    </div>
  );
}
