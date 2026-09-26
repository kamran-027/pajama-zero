"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Command,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  Inbox,
  Keyboard,
  Layers,
  Moon,
  Network,
  Pill,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Tag,
  Upload,
  User,
  Users,
  X,
  Zap
} from "lucide-react";
import { BackgroundGrid } from "@/components/ui/background-grid";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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

// Mock Clinical Vitals
function getPatientVitals(acuity: number) {
  if (acuity >= 9) {
    return { bp: "154/96", hr: "108", spo2: "94%", temp: "98.8°F", pain: "8/10", status: "Critical" };
  } else if (acuity >= 7) {
    return { bp: "138/88", hr: "88", spo2: "97%", temp: "101.3°F", pain: "6/10", status: "High Risk" };
  } else if (acuity >= 4) {
    return { bp: "128/82", hr: "76", spo2: "99%", temp: "98.6°F", pain: "4/10", status: "Moderate" };
  }
  return { bp: "120/78", hr: "72", spo2: "99%", temp: "98.4°F", pain: "0/10", status: "Stable" };
}

export default function PajamaZeroClinicalConsole() {
  const [presets, setPresets] = useState<PatientMessage[]>([]);
  const [results, setResults] = useState<JevTriageResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeLaneFilter, setActiveLaneFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchMetrics, setBatchMetrics] = useState<BatchResponse | null>(null);
  const [showTrace, setShowTrace] = useState<boolean>(true);
  const [showTestBench, setShowTestBench] = useState<boolean>(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importTab, setImportTab] = useState<"csv" | "ehr">("csv");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Custom Simulator State
  const [customPatient, setCustomPatient] = useState<string>("David Miller");
  const [customAge, setCustomAge] = useState<number>(54);
  const [customGender, setCustomGender] = useState<string>("M");
  const [customSubject, setCustomSubject] = useState<string>("Left knee swollen after pickleball");
  const [customBody, setCustomBody] = useState<string>("Twisted my left knee 4 days ago. Quite swollen and stiff walking down stairs. Do I need an MRI or stronger anti-inflammatory?");
  const [customHistory, setCustomHistory] = useState<string>("Mild Osteoarthritis, No prior surgeries");
  const [customMeds, setCustomMeds] = useState<string>("Naproxen 500mg");

  const handleDownloadSampleCsv = () => {
    const sampleData = [
      'patient_name,mrn,subject,body,patient_age,patient_gender,active_medications,relevant_history',
      '"Sarah Jenkins","MRN-10294","Crushing substernal chest pressure for 30 mins","Dr. Reynolds, having severe chest tightness radiating down left arm with shortness of breath.",62,"F","Lisinopril 10mg; Metoprolol 25mg","Hypertension, CAD"',
      '"Thomas Bradley","MRN-33921","Refill for Amlodipine 5mg","Down to my last 4 days of blood pressure pills. Can you please send 90-day refill to Walgreens?",68,"M","Amlodipine 5mg","Essential Hypertension"',
      '"Emily Chen","MRN-55812","Follow-up on persistent migraine","The sumatriptan is not relieving these daily throbbing headaches anymore. Need to discuss alternative prophylactic medications.",41,"F","Sumatriptan 50mg PRN; Oral Contraceptive","Chronic Migraine"',
      '"Marcus Vance","MRN-44910","Pre-op clearance paper signoff","Attached surgical clearance form for upcoming inguinal hernia repair next Tuesday. Vitals were checked yesterday.",55,"M","None","Inguinal Hernia"',
      '"Brenda Walsh","MRN-88201","Thank you note for last visit","Just wanted to thank Dr. Reynolds and the staff for the thorough care during my annual checkup! BP is looking much better.",59,"F","Hydrochlorothiazide 12.5mg","None"'
    ].join('\\n');

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pajamazero_inbasket_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotice("Sample EHR in-basket CSV template downloaded.");
  };

  const handleResetToStandardCases = () => {
    fetch(`${API_BASE}/api/inbox/presets`)
      .then((res) => res.json())
      .then((presetData: PatientMessage[]) => {
        setPresets(presetData);
        if (presetData && presetData.length > 0) {
          fetch(`${API_BASE}/api/triage/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: presetData })
          })
            .then((res) => res.json())
            .then((data: BatchResponse) => {
              setBatchMetrics(data);
              setResults(data.results);
              setSelectedIndex(0);
              setShowImportModal(false);
              triggerNotice("Reset to standard clinic in-basket (15 cases).");
            });
        }
      })
      .catch((err) => console.error("Reset error:", err));
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\\r?\\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          triggerNotice("CSV must contain a header row and at least one message row.");
          return;
        }

        const parseCsvLine = (line: string): string[] => {
          const result: string[] = [];
          let cur = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(cur.trim().replace(/^"|"$/g, ''));
              cur = "";
            } else {
              cur += char;
            }
          }
          result.push(cur.trim().replace(/^"|"$/g, ''));
          return result;
        };

        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z_]/g, ''));

        const newMessages: PatientMessage[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (cols.length < 2) continue;

          const rowMap: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowMap[h] = cols[idx] || "";
          });

          const name = rowMap.patient_name || rowMap.name || rowMap.patient || `Patient ${i}`;
          const mrn = rowMap.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
          const subject = rowMap.subject || rowMap.title || "Inbound Portal Inquiry";
          const body = rowMap.body || rowMap.message || rowMap.text || "No message body provided.";
          const age = parseInt(rowMap.patient_age || rowMap.age || "52", 10) || 52;
          const gender = (rowMap.patient_gender || rowMap.gender || "U").toUpperCase();
          const medsStr = rowMap.active_medications || rowMap.medications || rowMap.meds || "";
          const meds = medsStr ? medsStr.split(';').map((m) => m.trim()).filter(Boolean) : [];
          const history = rowMap.relevant_history || rowMap.history || "No documented chronic conditions.";

          newMessages.push({
            id: `csv-${Date.now()}-${i}`,
            patient_name: name,
            patient_age: age,
            patient_gender: gender,
            mrn: mrn,
            subject: subject,
            body: body,
            timestamp: "Today, Just now",
            relevant_history: history,
            active_medications: meds
          });
        }

        if (newMessages.length === 0) {
          triggerNotice("No valid patient messages found in CSV.");
          return;
        }

        setIsLoading(true);
        setShowImportModal(false);
        triggerNotice(`Triaging ${newMessages.length} imported messages...`);

        const res = await fetch(`${API_BASE}/api/triage/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages })
        });
        const data: BatchResponse = await res.json();
        setPresets(newMessages);
        setResults(data.results);
        setBatchMetrics(data);
        setSelectedIndex(0);
        setIsLoading(false);
        triggerNotice(`Successfully triaged ${newMessages.length} imported patient messages!`);
      } catch (err) {
        console.error("CSV import error:", err);
        setIsLoading(false);
        triggerNotice("Failed to parse or triage CSV file.");
      }
    };
    reader.readAsText(file);
  };

  // Auto-Hydrate on Mount
  useEffect(() => {
    fetch(`${API_BASE}/api/inbox/presets`)
      .then((res) => res.json())
      .then((presetData: PatientMessage[]) => {
        setPresets(presetData);
        if (presetData && presetData.length > 0) {
          fetch(`${API_BASE}/api/triage/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: presetData })
          })
            .then((res) => res.json())
            .then((data: BatchResponse) => {
              setBatchMetrics(data);
              setResults(data.results);
              setSelectedIndex(0);
            })
            .catch((err) => console.error("Initial batch triage error:", err));
        }
      })
      .catch((err) => console.error("Failed to load presets:", err));
  }, []);

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
      setSelectedIndex(0);
      triggerNotice(`Triaged ${data.total_messages} encounters in ${data.total_latency_ms.toFixed(0)}ms (${data.physician_deflection_rate}% deflected)`);
    } catch (e) {
      console.error("Batch triage error:", e);
      triggerNotice("Error connecting to triage engine");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCustomTriage = async () => {
    setIsLoading(true);
    const msg: PatientMessage = {
      id: `custom_${Date.now()}`,
      patient_name: customPatient || "Anonymous Patient",
      patient_age: customAge || 45,
      patient_gender: customGender || "U",
      mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: customSubject,
      body: customBody,
      timestamp: "Just now",
      relevant_history: customHistory,
      active_medications: customMeds.split(",").map((s) => s.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`${API_BASE}/api/triage/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const singleRes: JevTriageResult = await res.json();
      setResults((prev) => [singleRes, ...prev]);
      setSelectedIndex(0);
      setShowTestBench(false);
      triggerNotice(`Encounter evaluated in ${singleRes.latency_ms}ms: ${singleRes.lane_title}`);
    } catch (e) {
      console.error("Custom triage error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesLane = activeLaneFilter === "ALL" || item.lane === activeLaneFilter;
      const matchesQuery =
        !searchQuery ||
        item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.snippet.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLane && matchesQuery;
    });
  }, [results, activeLaneFilter, searchQuery]);

  const currentResult = filteredResults[selectedIndex] || filteredResults[0] || null;

  const currentPresetContext = useMemo(() => {
    if (!currentResult) return null;
    return presets.find((p) => p.id === currentResult.message_id) || null;
  }, [currentResult, presets]);

  const vitals = useMemo(() => {
    return getPatientVitals(currentResult?.acuity_score || 3);
  }, [currentResult]);

  // Keyboard Shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "e") {
        e.preventDefault();
        if (currentResult) {
          triggerNotice(`Encounter archived for ${currentResult.patient_name}`);
        }
      } else if (e.key === "d") {
        e.preventDefault();
        if (currentResult) {
          triggerNotice(`Order delegated to Medical Assistant for ${currentResult.patient_name}`);
        }
      } else if (e.key === "v") {
        e.preventDefault();
        if (currentResult) {
          triggerNotice(`Scheduling link sent to ${currentResult.patient_name}`);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentResult) {
          triggerNotice(`Signed and approved: ${currentResult.action_plan.slice(0, 45)}...`);
        }
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowShortcutsHelp((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowTestBench((prev) => !prev);
      }
    },
    [filteredResults, currentResult]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getLaneStyle = (lane: string) => {
    switch (lane) {
      case "01_EMERGENCY_DIVERT":
        return {
          label: "Emergency Red-Flag",
          color: "text-rose-700",
          tagBg: "bg-rose-50 text-rose-700 border border-rose-200",
          border: "border-rose-300",
          code: "EMERGENCY"
        };
      case "02_STAFF_DELEGATE":
        return {
          label: "Staff Delegation",
          color: "text-slate-700",
          tagBg: "bg-slate-100 text-slate-700 border border-slate-200",
          border: "border-slate-200",
          code: "MA POOL"
        };
      case "03_CONVERT_TO_VISIT":
        return {
          label: "Convert to Visit",
          color: "text-amber-800",
          tagBg: "bg-amber-50 text-amber-800 border border-amber-200",
          border: "border-amber-300",
          code: "SCHEDULING"
        };
      case "04_PHYSICIAN_REVIEW":
        return {
          label: "Physician Review",
          color: "text-emerald-700",
          tagBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          border: "border-emerald-300",
          code: "MD INBOX"
        };
      case "05_AUTO_RESOLVE":
        return {
          label: "Auto-Resolved",
          color: "text-slate-500",
          tagBg: "bg-slate-100 text-slate-500 border border-slate-200",
          border: "border-slate-200",
          code: "ARCHIVED"
        };
      default:
        return {
          label: lane,
          color: "text-slate-700",
          tagBg: "bg-slate-100 text-slate-700 border border-slate-200",
          border: "border-slate-200",
          code: "GENERAL"
        };
    }
  };

  const laneTabs = [
    { id: "ALL", label: "All Messages", count: results.length > 0 ? results.length : presets.length },
    { id: "01_EMERGENCY_DIVERT", label: "Emergency", count: results.filter((r) => r.lane === "01_EMERGENCY_DIVERT").length, dot: "bg-rose-500" },
    { id: "04_PHYSICIAN_REVIEW", label: "MD Priority", count: results.filter((r) => r.lane === "04_PHYSICIAN_REVIEW").length, dot: "bg-emerald-500" },
    { id: "02_STAFF_DELEGATE", label: "Staff Delegate", count: results.filter((r) => r.lane === "02_STAFF_DELEGATE").length, dot: "bg-slate-400" },
    { id: "03_CONVERT_TO_VISIT", label: "Convert to Visit", count: results.filter((r) => r.lane === "03_CONVERT_TO_VISIT").length, dot: "bg-amber-500" },
    { id: "05_AUTO_RESOLVE", label: "Archived", count: results.filter((r) => r.lane === "05_AUTO_RESOLVE").length, dot: "bg-slate-400" }
  ];

  return (
    <BackgroundGrid>
      <div className="flex flex-col min-h-screen max-w-[1680px] mx-auto px-4 sm:px-6 py-4 sm:py-5 gap-3.5 sm:gap-4 w-full">
        {/* 1. ARCHITECTURAL CLINICAL COMMAND HEADER */}
        <header className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 shadow-sm w-full min-w-0">
          {/* Left: Brand & Clinical Context */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xs text-white shrink-0">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">PAJAMAZERO</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-clinical px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shrink-0">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  AUTONOMOUS TRIAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                Apex Health System &bull; Dr. Reynolds &bull; IM In-Basket
              </p>
            </div>
          </div>

          {/* Center: Executive Clinical Impact HUD */}
          <div className="hidden lg:flex items-center gap-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 px-4 py-1.5 text-xs font-mono-clinical text-slate-600 shadow-2xs shrink-0">
            {/* 1. Time Saved */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Nightly Saved:</span>
                <strong className="text-slate-900 font-bold text-xs">
                  {batchMetrics ? `${Math.floor(batchMetrics.pajama_time_saved_minutes / 60)}h ${batchMetrics.pajama_time_saved_minutes % 60}m` : "2h 15m"}
                </strong>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200 shrink-0" />

            {/* 2. Deflection Rate */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Deflection:</span>
                <strong className="text-emerald-700 font-bold text-xs">
                  {batchMetrics ? `${batchMetrics.physician_deflection_rate}%` : "80.0%"}
                </strong>
                <span className="text-[10px] text-slate-600 font-medium">
                  {batchMetrics ? `(${batchMetrics.deflected_count}/${batchMetrics.total_messages})` : "(12/15)"}
                </span>
              </div>
            </div>

            <div className="hidden xl:block h-4 w-px bg-slate-200 shrink-0" />

            {/* 3. Latency */}
            <div className="hidden xl:flex items-center gap-2 whitespace-nowrap">
              <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Latency:</span>
                <strong className="text-slate-900 font-bold text-xs">
                  {batchMetrics ? `${batchMetrics.average_latency_ms}ms` : "65.5ms"}
                </strong>
              </div>
            </div>

            <div className="hidden 2xl:block h-4 w-px bg-slate-200 shrink-0" />

            {/* 4. Cost */}
            <div className="hidden 2xl:flex items-center gap-2 whitespace-nowrap">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Cost:</span>
                <strong className="text-slate-900 font-bold text-xs">
                  ${batchMetrics ? batchMetrics.total_cost_usd.toFixed(5) : "0.00012"}
                </strong>
              </div>
            </div>
          </div>

          {/* Right: Actions Island (Always Fits, Never Cuts Off) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowShortcutsHelp(true)}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Keys</span>
              <kbd className="px-1 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded border border-slate-200 font-mono-clinical">?</kbd>
            </button>

            <button
              onClick={() => setShowTestBench(true)}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
              title="Interactive Test Bench (⌘K)"
            >
              <Command className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Simulator</span>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded border border-slate-200 font-mono-clinical">⌘K</kbd>
            </button>

            <ShimmerButton
              onClick={handleRunBatchTriage}
              disabled={isLoading}
              className="h-9 px-3.5 sm:px-4 text-xs font-bold rounded-xl whitespace-nowrap shadow-sm hover:shadow active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Triage Queue</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-clinical text-slate-200 font-bold">
                    {presets.length || 15}
                  </span>
                </div>
              )}
            </ShimmerButton>
          </div>
        </header>

        {/* 2. FLOATING TABS BAR (Clean Clinical White) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Animated Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
            {laneTabs.map((tab) => {
              const isActive = activeLaneFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveLaneFilter(tab.id);
                    setSelectedIndex(0);
                  }}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-2 ${
                    isActive ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-xl bg-slate-900 shadow-sm"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono-clinical px-1.5 py-0.5 rounded ${isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"}`}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Import Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <div className="relative w-full md:w-56 lg:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search queue, MRN (/)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="h-9 w-full pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
            </div>

            <button
              onClick={() => setShowImportModal(true)}
              className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm active:scale-[0.98]"
              title="Upload In-Basket CSV or Connect EHR"
            >
              <Upload className="w-3.5 h-3.5 text-slate-300" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>

        {/* 3. SPACIOUS MASTER-DETAIL CLINICAL WORKSPACE */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 pb-4 overflow-hidden">
          {/* LEFT COLUMN: Queue Cards */}
          <div className="w-full lg:w-[440px] xl:w-[460px] rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md flex flex-col shrink-0 shadow-sm overflow-hidden">
            <div className="h-9 px-4 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono-clinical uppercase tracking-wider bg-slate-50/80 font-bold">
              <span>Patient &bull; Clinical Complaint</span>
              <span>Acuity &bull; Route</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 max-h-[calc(100vh-215px)]">
              {filteredResults.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Inbox className="w-10 h-10 text-slate-300" />
                  <p className="text-xs">No matching patient encounters in this lane.</p>
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const lane = getLaneStyle(item.lane);

                  return (
                    <motion.div
                      key={item.message_id}
                      onClick={() => setSelectedIndex(idx)}
                      whileHover={{ scale: 1.008 }}
                      transition={{ duration: 0.15 }}
                      className={`p-4 rounded-xl cursor-pointer relative flex flex-col gap-1.5 border transition-all ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-500/20"
                          : "bg-white hover:bg-slate-50/80 border-slate-200"
                      }`}
                    >
                      {/* Line 1: Patient Name & Acuity */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.patient_name}</span>
                          <span className="text-[10px] font-mono-clinical px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.mrn}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono-clinical text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                            ⚡ {item.latency_ms}ms
                          </span>
                          <span
                            className={`text-[9px] font-mono-clinical font-extrabold px-1.5 py-0.5 rounded border ${
                              item.acuity_score >= 9
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : item.acuity_score >= 7
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : item.acuity_score >= 4
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            A{item.acuity_score}
                          </span>
                        </div>
                      </div>

                      {/* Line 2: Subject */}
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">
                        {item.subject}
                      </p>

                      {/* Line 3: Snippet */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>

                      {/* Line 4: Destination Badge */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-mono-clinical font-bold ${lane.tagBg}`}>
                          {lane.code}
                        </span>
                        <span className="text-slate-400 font-mono-clinical">{item.timestamp}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Rich Clinical Chart Workspace (Pure White Bento Grid) */}
          <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[calc(100vh-215px)] pr-1.5 sm:pr-2">
            {currentResult ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentResult.message_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3.5"
                >
                  {/* BENTO 1: PATIENT PROFILE & REAL-TIME VITALS */}
                  <CardSpotlight className="flex flex-col gap-3.5 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-extrabold text-blue-700 shadow-sm">
                          {currentResult.patient_name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{currentResult.patient_name}</h2>
                            <span className="text-xs font-mono-clinical px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                              {currentResult.mrn}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Age {currentPresetContext?.patient_age || 50} &bull; Gender {currentPresetContext?.patient_gender || "U"} &bull; Primary Payer: BlueCross BlueShield PPO
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`text-xs font-mono-clinical px-3 py-1 rounded-lg font-bold shadow-sm ${getLaneStyle(currentResult.lane).tagBg}`}>
                          {getLaneStyle(currentResult.lane).label}
                        </span>
                      </div>
                    </div>

                    {/* Vitals Telemetry Row (Spacious Clean White Cards) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center font-mono-clinical">
                        <span className="text-[10px] uppercase text-slate-500 block mb-0.5 font-bold">Blood Pressure</span>
                        <span className="font-extrabold text-sm text-slate-900">{vitals.bp}</span>
                        <span className="text-[9px] text-slate-400 block">mmHg</span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center font-mono-clinical">
                        <span className="text-[10px] uppercase text-slate-500 block mb-0.5 font-bold">Heart Rate</span>
                        <span className="font-extrabold text-sm text-slate-900">{vitals.hr}</span>
                        <span className="text-[9px] text-slate-400 block">bpm</span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center font-mono-clinical">
                        <span className="text-[10px] uppercase text-slate-500 block mb-0.5 font-bold">Oxygen Sat</span>
                        <span className="font-extrabold text-sm text-slate-900">{vitals.spo2}</span>
                        <span className="text-[9px] text-slate-400 block">Room Air</span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center font-mono-clinical">
                        <span className="text-[10px] uppercase text-slate-500 block mb-0.5 font-bold">Temperature</span>
                        <span className="font-extrabold text-sm text-slate-900">{vitals.temp}</span>
                        <span className="text-[9px] text-slate-400 block">Oral Core</span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center font-mono-clinical">
                        <span className="text-[10px] uppercase text-slate-500 block mb-0.5 font-bold">Pain Rating</span>
                        <span className={`font-extrabold text-sm ${currentResult.acuity_score >= 8 ? "text-rose-600" : "text-slate-900"}`}>
                          {vitals.pain}
                        </span>
                        <span className="text-[9px] text-slate-500 block">{vitals.status}</span>
                      </div>
                    </div>

                    {/* Medical History & Current Meds */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                        <span className="text-[10px] font-mono-clinical uppercase tracking-wider text-slate-500 block mb-1 font-bold">
                          Documented Clinical History
                        </span>
                        <p className="text-slate-700 font-mono-clinical text-xs leading-relaxed">
                          {currentPresetContext?.relevant_history || "No prior surgical or chronic conditions logged."}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                        <span className="text-[10px] font-mono-clinical uppercase tracking-wider text-slate-500 block mb-1 font-bold">
                          Active Medication Regimen
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentPresetContext?.active_medications && currentPresetContext.active_medications.length > 0 ? (
                            currentPresetContext.active_medications.map((m, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-mono-clinical text-slate-700 shadow-2xs">
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">No active medications</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardSpotlight>

                  {/* BENTO 2: INBOUND PATIENT PORTAL ENCOUNTER */}
                  <CardSpotlight className="flex flex-col gap-2.5 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-800 font-bold text-xs uppercase tracking-wider font-mono-clinical">Inbound Clinical Communication</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="font-mono-clinical text-slate-500">{currentResult.timestamp}</span>
                      </div>
                      <span className="text-xs font-mono-clinical text-slate-600 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium">
                        Portal: Epic MyChart
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 pt-1 leading-snug">{currentResult.subject}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line py-1">
                      {currentPresetContext?.body || currentResult.snippet}
                    </p>
                  </CardSpotlight>

                  {/* BENTO 3: CLINICAL DECISION TRACE & SPEED BENCHMARK */}
                  <CardSpotlight className="flex flex-col gap-3.5 p-4 sm:p-5">
                    <div
                      onClick={() => setShowTrace(!showTrace)}
                      className="flex items-center justify-between cursor-pointer pb-2 border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-4 h-4 text-teal-600" />
                        <h4 className="font-mono-clinical text-xs text-slate-900 font-extrabold tracking-wider uppercase">
                          Deterministic Clinical Decision Trace
                        </h4>
                        <span className="text-xs font-mono-clinical text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-bold">
                          {currentResult.latency_ms}ms &bull; ${currentResult.token_cost_usd.toFixed(6)}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showTrace ? "" : "-rotate-90"}`} />
                    </div>

                    {showTrace && (
                      <div className="flex flex-col gap-3">
                        {/* Primitives Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono-clinical text-xs">
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Lane Routing</span>
                            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentResult.lane}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Deterministic routing</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Acuity Risk Index</span>
                            <span className="font-bold text-amber-700 text-sm mt-0.5 block">Acuity Level {currentResult.acuity_score} / 10</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Continuous triage index</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Physician License Safeguard</span>
                            <span className={`font-bold text-sm mt-0.5 block ${currentResult.requires_physician_license ? "text-rose-700" : "text-emerald-700"}`}>
                              {currentResult.requires_physician_license ? "REQUIRED (MD)" : "NOT REQUIRED"}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">Legal medical safeguard</span>
                          </div>
                        </div>

                        {/* Visual Benchmark Comparison Bar */}
                        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col gap-1.5 font-mono-clinical text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-700 font-bold">Execution Latency Benchmark</span>
                            <span className="text-emerald-700 font-extrabold">28x Faster Than Standard LLMs</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300">
                            <div className="bg-teal-500 h-full w-[4%]" title="PajamaZero: 65ms" />
                            <div className="bg-slate-400 h-full w-[96%]" title="Standard LLM: 1,800ms" />
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[10px] pt-0.5">
                            <span className="text-teal-700 font-bold">⚡ PajamaZero: {currentResult.latency_ms}ms ($0.000008)</span>
                            <span>Standard LLM: ~1,800ms ($0.015000)</span>
                          </div>
                        </div>

                        {/* Clinical Rationale Text */}
                        <div className="text-xs leading-relaxed text-slate-700 border-t border-slate-100 pt-2.5">
                          <strong className="text-slate-900">Clinical Triage Rationale: </strong>
                          {currentResult.clinical_rationale}
                        </div>
                      </div>
                    )}
                  </CardSpotlight>

                  {/* BENTO 4: CLINICAL ORDER & DELEGATION SLIP */}
                  <CardSpotlight className="flex flex-col gap-3.5 p-4 sm:p-5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <h4 className="font-mono-clinical text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Clinical Order & Delegation Slip
                        </h4>
                      </div>
                      <span className="text-xs font-mono-clinical text-slate-600">
                        Assigned To: <strong className="text-slate-900">{currentResult.delegated_to}</strong>
                      </span>
                    </div>

                    <div className="text-xs font-mono-clinical bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed shadow-inner">
                      <p className="font-bold text-slate-900 mb-1.5">{currentResult.action_plan}</p>
                      <p className="text-slate-600 text-xs border-t border-slate-200 pt-2 mt-1.5">
                        {currentResult.pre_drafted_action}
                      </p>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-clinical">
                        <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px]">Enter</kbd> to sign</span>
                        <span>&bull;</span>
                        <span><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px]">D</kbd> delegate</span>
                        <span>&bull;</span>
                        <span><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px]">V</kbd> visit</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => triggerNotice(`Order delegated to Medical Assistant pool for ${currentResult.patient_name}`)}
                          className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                        >
                          Delegate to MA (D)
                        </button>
                        <button
                          onClick={() => triggerNotice(`Clinical order signed and dispatched for ${currentResult.patient_name}`)}
                          className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Sign Order (↵)</span>
                        </button>
                      </div>
                    </div>
                  </CardSpotlight>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="h-full min-h-[480px] rounded-2xl border border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center text-slate-400 gap-2 p-12 text-center">
                <Inbox className="w-10 h-10 text-slate-300" />
                <p className="text-xs">Select any patient message from the queue</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs shadow-2xl flex items-center gap-3 font-mono-clinical"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM TEST BENCH (Cmd+K) */}
      <AnimatePresence>
        {showTestBench && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Command className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono-clinical">
                    Clinical Message Test Bench
                  </h3>
                </div>
                <button
                  onClick={() => setShowTestBench(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3.5 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-slate-500 text-xs block mb-1 font-mono-clinical font-semibold">Patient Full Name</label>
                    <input
                      type="text"
                      value={customPatient}
                      onChange={(e) => setCustomPatient(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs block mb-1 font-mono-clinical font-semibold">Age / Sex</label>
                    <input
                      type="text"
                      value={`${customAge}${customGender}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomAge(parseInt(val) || 50);
                      }}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-mono-clinical"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs block mb-1 font-mono-clinical font-semibold">Encounter Subject</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-xs block mb-1 font-mono-clinical font-semibold">Patient Message Body</label>
                  <textarea
                    rows={4}
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-xs block mb-1 font-mono-clinical font-semibold">Clinical History & Meds</label>
                  <input
                    type="text"
                    value={customHistory}
                    onChange={(e) => setCustomHistory(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500 font-mono-clinical">Sub-80ms Autonomous Triage</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTestBench(false)}
                    className="h-9 px-4 rounded-xl text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRunCustomTriage}
                    disabled={isLoading}
                    className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Triage</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHORTCUTS HELP MODAL */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-xs font-mono-clinical"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Keyboard Shortcuts</h3>
                <button onClick={() => setShowShortcutsHelp(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="flex flex-col gap-3 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Next encounter</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">J</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Previous encounter</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Approve & Sign order</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">Enter</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delegate to MA pool</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">D</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Convert to visit</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">V</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Archive encounter</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">E</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Test Bench Drawer</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">⌘K</kbd>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-right">
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="h-8 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IN-BASKET INGESTION & EHR INTEGRATION MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono-clinical">
                      In-Basket Ingestion & EHR Pipeline
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Upload clinical message batch (.csv) or connect hospital EMR
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setImportTab("csv")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    importTab === "csv"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CSV Batch</span>
                </button>
                <button
                  onClick={() => setImportTab("ehr")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    importTab === "ehr"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>EHR Integration Options</span>
                </button>
              </div>

              {importTab === "csv" ? (
                <div className="flex flex-col gap-4">
                  {/* Drop zone */}
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Upload Patient In-Basket CSV
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Drag and drop your file or click to browse (.csv)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Sample Template & Reset Actions */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">Need a sample EHR CSV?</span>
                      <span className="text-[11px] text-slate-500">
                        Download pre-formatted CSV with required clinical columns
                      </span>
                    </div>
                    <button
                      onClick={handleDownloadSampleCsv}
                      className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download Template</span>
                    </button>
                  </div>

                  {/* Preset Reset Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={handleResetToStandardCases}
                      className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 font-mono-clinical underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to standard 15 clinic cases</span>
                    </button>
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="h-8 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 text-xs">
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    PajamaZero integrates natively into existing hospital infrastructure without disrupting physician workflow:
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">1. SMART on FHIR / HL7 API</strong>
                        <span className="text-[9px] font-mono-clinical font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Native EMR</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Direct webhook synchronization with Epic MyChart, Cerner Millennium, or AthenaHealth. Listens for inbound <code className="font-mono-clinical bg-white px-1 py-0.2 rounded border text-[10px]">Communication</code> resources and dispatches auto-drafted <code className="font-mono-clinical bg-white px-1 py-0.2 rounded border text-[10px]">Task</code> routing slips.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">2. Secure Clinical Email Forwarder</strong>
                        <span className="text-[9px] font-mono-clinical font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Zero-IT Setup</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Route automated patient portal notification emails to a dedicated clinic endpoint (<code className="font-mono-clinical bg-white px-1 py-0.2 rounded border text-[10px]">triage@clinic.pajamazero.health</code>) with TLS 1.3 / HIPAA encryption.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">3. Epic Hyperdrive / Browser Sidecar</strong>
                        <span className="text-[9px] font-mono-clinical font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">1-Click Overlay</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Runs directly inside the physician's browser or Epic Hyperdrive workstation, overlaying sub-80ms triage classifications and 1-click order slips right over the native in-basket.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">4. Automated Nightly SFTP Batch</strong>
                        <span className="text-[9px] font-mono-clinical font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Enterprise Batch</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Hospital IT drops encrypted morning CSV exports at 5:00 AM. PajamaZero batches and deflects 80% of clutter before doctors start morning rounds.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="h-8 px-4 rounded-lg bg-slate-900 text-white font-semibold text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BackgroundGrid>
  );
}
