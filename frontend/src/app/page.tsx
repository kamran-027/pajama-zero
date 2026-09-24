"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Flame,
  HeartPulse,
  Hospital,
  Layers,
  Moon,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Zap
} from "lucide-react";

interface PatientMessage {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  mrn: string;
  subject: string;
  body: string;
  timestamp: string;
  relevant_history?: string;
  active_medications: string[];
}

interface JevTriageResult {
  message_id: string;
  patient_name: string;
  mrn: string;
  subject: string;
  snippet: string;
  lane: string;
  lane_title: string;
  lane_badge_color: string;
  acuity_score: number;
  requires_physician_license: boolean;
  clinical_rationale: string;
  delegated_to: string;
  action_plan: string;
  pre_drafted_action: string;
  latency_ms: number;
  token_cost_usd: number;
  evaluated_by: string;
  timestamp: string;
}

interface BatchResponse {
  results: JevTriageResult[];
  total_messages: number;
  physician_queue_count: number;
  deflected_count: number;
  physician_deflection_rate: number;
  total_latency_ms: number;
  average_latency_ms: number;
  total_cost_usd: number;
  estimated_gpt4_cost_usd: number;
  pajama_time_saved_minutes: number;
  lane_distribution: Record<string, number>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function PajamaZeroDashboard() {
  const [presets, setPresets] = useState<PatientMessage[]>([]);
  const [results, setResults] = useState<JevTriageResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<JevTriageResult | null>(null);
  const [activeLaneFilter, setActiveLaneFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchMetrics, setBatchMetrics] = useState<BatchResponse | null>(null);

  // Custom Simulator State
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [customSubject, setCustomSubject] = useState<string>("Severe chest tightness since 20 minutes ago");
  const [customBody, setCustomBody] = useState<string>("Dr. Khan, I woke up with severe pressure on my chest and pain in my left arm. Feel lightheaded. Should I drive to the clinic?");
  const [customPatient, setCustomPatient] = useState<string>("Jonathan Reed");
  const [customHistory, setCustomHistory] = useState<string>("Hypertension, CAD s/p stent");

  // Fetch presets on initial load
  useEffect(() => {
    fetch(`${API_BASE}/api/inbox/presets`)
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
      })
      .catch((err) => console.error("Error loading presets:", err));
  }, []);

  // Run Batch Triage
  const handleRunBatchTriage = async () => {
    if (!presets || presets.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/triage/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: presets })
      });
      const data: BatchResponse = await res.json();
      setBatchMetrics(data);
      setResults(data.results);
      if (data.results.length > 0) {
        setSelectedResult(data.results[0]);
      }
    } catch (e) {
      console.error("Batch triage error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Custom Message Triage
  const handleRunCustomTriage = async () => {
    setIsLoading(true);
    const customMsg: PatientMessage = {
      id: `custom_${Date.now()}`,
      patient_name: customPatient || "Anonymous Patient",
      patient_age: 52,
      patient_gender: "M",
      mrn: "MRN-CUSTOM",
      subject: customSubject,
      body: customBody,
      timestamp: "Just now",
      relevant_history: customHistory,
      active_medications: ["Lisinopril 20mg"]
    };

    try {
      const res = await fetch(`${API_BASE}/api/triage/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: customMsg })
      });
      const singleRes: JevTriageResult = await res.json();
      setResults((prev) => [singleRes, ...prev]);
      setSelectedResult(singleRes);
      setShowSimulator(false);
    } catch (e) {
      console.error("Custom triage error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Results
  const filteredResults = results.filter((r) => {
    if (activeLaneFilter === "ALL") return true;
    return r.lane === activeLaneFilter;
  });

  const getLaneMeta = (lane: string) => {
    switch (lane) {
      case "01_EMERGENCY_DIVERT":
        return {
          title: "Emergency Red-Flag",
          border: "border-rose-500/40",
          bg: "bg-rose-950/20",
          pill: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
        };
      case "02_STAFF_DELEGATE":
        return {
          title: "Staff Delegation (MA)",
          border: "border-sky-500/30",
          bg: "bg-sky-950/20",
          pill: "bg-sky-500/10 text-sky-400 border-sky-500/30",
          icon: <Users className="w-4 h-4 text-sky-400" />
        };
      case "03_CONVERT_TO_VISIT":
        return {
          title: "Convert to Billable Visit",
          border: "border-amber-500/30",
          bg: "bg-amber-950/20",
          pill: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <Hospital className="w-4 h-4 text-amber-400" />
        };
      case "04_PHYSICIAN_REVIEW":
        return {
          title: "Doctor Priority Review",
          border: "border-emerald-500/40",
          bg: "bg-emerald-950/20",
          pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <Stethoscope className="w-4 h-4 text-emerald-400" />
        };
      case "05_AUTO_RESOLVE":
        return {
          title: "Auto-Resolved / Archived",
          border: "border-slate-700/40",
          bg: "bg-slate-900/30",
          pill: "bg-slate-800 text-slate-400 border-slate-700",
          icon: <CheckCircle2 className="w-4 h-4 text-slate-400" />
        };
      default:
        return {
          title: lane,
          border: "border-slate-800",
          bg: "bg-slate-900/40",
          pill: "bg-slate-800 text-slate-400",
          icon: <FileText className="w-4 h-4" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Clinical Header */}
      <header className="border-b border-slate-800/80 bg-[#0a101d]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">PajamaZero</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold tracking-wider">
                System One Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              St. Jude Ambulatory Health &bull; Dr. Kamran Khan, MD &bull; Epic MyChart In-Basket
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>JEV Sub-100ms Model: <strong className="text-teal-400 font-semibold">Active</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimulator(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-slate-400" />
              <span>Test Single Message</span>
            </button>

            <button
              onClick={handleRunBatchTriage}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Triaging 15 Messages...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>⚡ Triage Morning In-Basket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main KPI Telemetry Bar */}
      <section className="bg-[#0b1222] border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Pajama Time Saved */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Pajama Time Saved</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white">
                  {batchMetrics ? `${Math.floor(batchMetrics.pajama_time_saved_minutes / 60)}h ${batchMetrics.pajama_time_saved_minutes % 60}m` : "2h 15m"}
                </span>
                <span className="text-[11px] text-teal-400 font-medium">Tonight</span>
              </div>
            </div>
          </div>

          {/* Card 2: Deflection Rate */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Inbox Deflection</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-indigo-300">
                  {batchMetrics ? `${batchMetrics.physician_deflection_rate}%` : "80.0%"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {batchMetrics ? `(${batchMetrics.deflected_count}/${batchMetrics.total_messages} Safe)` : "(12/15 Safe)"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Decision Latency */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Avg JEV Latency</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-amber-300">
                  {batchMetrics ? `${batchMetrics.average_latency_ms} ms` : "64.5 ms"}
                </span>
                <span className="text-[11px] text-slate-400 line-through">1,800ms GPT-4</span>
              </div>
            </div>
          </div>

          {/* Card 4: Cost Comparison */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Triage Batch Cost</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-emerald-400">
                  ${batchMetrics ? batchMetrics.total_cost_usd.toFixed(5) : "0.00012"}
                </span>
                <span className="text-[11px] text-slate-400">vs $0.22 GPT-4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lane Filter Tabs */}
      <section className="px-6 py-3 border-b border-slate-800/60 bg-[#080d19]/80 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Lanes:
          </span>

          <button
            onClick={() => setActiveLaneFilter("ALL")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeLaneFilter === "ALL"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            All Messages ({results.length > 0 ? results.length : presets.length})
          </button>

          <button
            onClick={() => setActiveLaneFilter("01_EMERGENCY_DIVERT")}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeLaneFilter === "01_EMERGENCY_DIVERT"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-rose-400 hover:bg-rose-950/20"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Emergency Divert</span>
            <span className="text-[10px] font-mono px-1 rounded bg-rose-500/20 text-rose-300">
              {results.filter((r) => r.lane === "01_EMERGENCY_DIVERT").length}
            </span>
          </button>

          <button
            onClick={() => setActiveLaneFilter("04_PHYSICIAN_REVIEW")}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeLaneFilter === "04_PHYSICIAN_REVIEW"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/20"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
            <span>Doctor Priority</span>
            <span className="text-[10px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
              {results.filter((r) => r.lane === "04_PHYSICIAN_REVIEW").length}
            </span>
          </button>

          <button
            onClick={() => setActiveLaneFilter("02_STAFF_DELEGATE")}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeLaneFilter === "02_STAFF_DELEGATE"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-400 hover:text-sky-400 hover:bg-sky-950/20"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Staff Delegate</span>
            <span className="text-[10px] font-mono px-1 rounded bg-sky-500/20 text-sky-300">
              {results.filter((r) => r.lane === "02_STAFF_DELEGATE").length}
            </span>
          </button>

          <button
            onClick={() => setActiveLaneFilter("03_CONVERT_TO_VISIT")}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeLaneFilter === "03_CONVERT_TO_VISIT"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-amber-400 hover:bg-amber-950/20"
            }`}
          >
            <Hospital className="w-3.5 h-3.5 text-amber-400" />
            <span>Convert to Visit</span>
            <span className="text-[10px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
              {results.filter((r) => r.lane === "03_CONVERT_TO_VISIT").length}
            </span>
          </button>

          <button
            onClick={() => setActiveLaneFilter("05_AUTO_RESOLVE")}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeLaneFilter === "05_AUTO_RESOLVE"
                ? "bg-slate-700 text-slate-200"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Auto-Resolved</span>
            <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
              {results.filter((r) => r.lane === "05_AUTO_RESOLVE").length}
            </span>
          </button>
        </div>

        {results.length > 0 && (
          <button
            onClick={() => {
              setResults([]);
              setSelectedResult(null);
              setBatchMetrics(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </section>

      {/* Main Content Area: Split View */}
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Message Queue List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Patient Queue ({filteredResults.length})
            </h2>
            <span className="text-xs text-slate-400">
              {results.length === 0 ? "Click '⚡ Triage Morning In-Basket' to run JEV" : "Sorted by Clinical Priority"}
            </span>
          </div>

          {/* Empty / Untriaged State */}
          {results.length === 0 && (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">15 Real-World In-Basket Messages Loaded</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Ready to run JEV System One classification across cardiac red flags, refills, biopsy discussions, and thank-yous.
                </p>
              </div>
              <button
                onClick={handleRunBatchTriage}
                disabled={isLoading}
                className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-md transition-all flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Sub-100ms Triage Now</span>
              </button>
            </div>
          )}

          {/* Triaged Message List */}
          <div className="flex flex-col gap-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredResults.map((item) => {
              const meta = getLaneMeta(item.lane);
              const isSelected = selectedResult?.message_id === item.message_id;

              return (
                <div
                  key={item.message_id}
                  onClick={() => setSelectedResult(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? "bg-slate-800/90 border-teal-500/60 shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/40"
                      : "bg-[#0b1222]/80 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">{item.patient_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.mrn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                        ⚡ {item.latency_ms}ms
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          item.acuity_score >= 9
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : item.acuity_score >= 7
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : item.acuity_score >= 4
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        Acuity {item.acuity_score}/10
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-300 mt-1 line-clamp-1">{item.subject}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.snippet}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium flex items-center gap-1 ${meta.pill}`}>
                      {meta.icon}
                      <span>{meta.title}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.requires_physician_license ? "MD License Required" : "Staff Handled"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Clinical Detail & JEV Telemetry Inspector */}
        <div className="lg:col-span-7">
          {selectedResult ? (
            <div className="bg-[#0b1222]/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6 sticky top-20">
              {/* Header with Acuity & Emergency Status */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedResult.patient_name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedResult.mrn}
                    </span>
                    <span className="text-xs text-slate-400">&bull; {selectedResult.timestamp}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-teal-300 mt-1">{selectedResult.subject}</h4>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold">
                      ⚡ {selectedResult.latency_ms} ms Latency
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                        selectedResult.acuity_score >= 9
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse"
                          : selectedResult.acuity_score >= 7
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      Acuity {selectedResult.acuity_score} / 10
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Token Cost: ${selectedResult.token_cost_usd.toFixed(6)}
                  </span>
                </div>
              </div>

              {/* JEV System One Typed Primitives Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">JEV Primitive: Choice</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5">{selectedResult.lane_title}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Deterministic lane classification</span>
                </div>

                <div className="flex flex-col border-x border-slate-800 px-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">JEV Primitive: Score</span>
                  <span className="text-xs font-bold text-amber-300 mt-0.5">Level {selectedResult.acuity_score} / 10</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Continuous clinical urgency</span>
                </div>

                <div className="flex flex-col pl-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">JEV Primitive: Noul</span>
                  <span className={`text-xs font-bold mt-0.5 ${selectedResult.requires_physician_license ? "text-rose-400" : "text-teal-400"}`}>
                    {selectedResult.requires_physician_license ? "License Required: YES" : "License Required: NO"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Boolean legal safeguard</span>
                </div>
              </div>

              {/* Clinical Rationale & Delegation Plan */}
              <div className="flex flex-col gap-2">
                <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Clinical Rationale & Delegated Action
                </h5>
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <p className="font-medium text-slate-200">{selectedResult.clinical_rationale}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Delegated To: <strong className="text-teal-300">{selectedResult.delegated_to}</strong></span>
                    <span>Evaluated By: {selectedResult.evaluated_by}</span>
                  </div>
                </div>
              </div>

              {/* Automated Action Slip / Dispatch Protocol */}
              <div className="flex flex-col gap-2">
                <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Automated Clinical Action Slip
                </h5>
                <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs font-mono text-indigo-200 leading-relaxed">
                  <p className="font-semibold text-indigo-100">{selectedResult.action_plan}</p>
                  <div className="mt-2.5 p-2.5 rounded bg-slate-950/80 border border-indigo-500/20 text-slate-300">
                    {selectedResult.pre_drafted_action}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => alert(`Action confirmed: ${selectedResult.delegated_to} notified.`)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Approve Routing
                </button>
                <button
                  onClick={() => alert(`Encounter archived to chart for ${selectedResult.patient_name}.`)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 transition-colors"
                >
                  Sign & Close Task
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[480px] rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2 p-8 text-center">
              <Stethoscope className="w-8 h-8 text-slate-600" />
              <p className="text-sm">Select any patient message from the queue to inspect JEV System One telemetry.</p>
            </div>
          )}
        </div>
      </main>

      {/* Custom Message Simulator Modal */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" />
                <h3 className="text-base font-bold text-white">Test Custom Message with JEV</h3>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Patient Name</label>
                <input
                  type="text"
                  value={customPatient}
                  onChange={(e) => setCustomPatient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Medical History</label>
                <input
                  type="text"
                  value={customHistory}
                  onChange={(e) => setCustomHistory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSimulator(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRunCustomTriage}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Evaluate with JEV (Sub-100ms)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080d19] px-6 py-4 text-center text-xs text-slate-500">
        <p>
          PajamaZero &bull; Sub-100ms Clinical In-Basket Triage &bull; Built with TypeSafe AI JEV & LangGraph &bull; Created by Kamran Khan
        </p>
      </footer>
    </div>
  );
}
