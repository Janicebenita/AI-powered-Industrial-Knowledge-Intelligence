import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, BadgeCheck, BookOpen, ClipboardCheck, Factory, FileSearch, Gauge, ShieldCheck, Wrench, Zap } from "lucide-react";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ValidationStatus = "Approved" | "Needs Review" | "Rejected";

export type IndustrialAsset = {
  tag: string;
  name: string;
  type: string;
  location: string;
  status: string;
  riskScore: number;
  reliabilityScore: number;
  complianceStatus: "Ready" | "Partial" | "At Risk";
  mtbf: number;
  mttr: number;
  failureModes: string[];
  nextAction: string;
};

export const assets: IndustrialAsset[] = [
  { tag: "P101", name: "Condensate Transfer Pump", type: "Centrifugal Pump", location: "Unit A / Train 1", status: "Running with advisory", riskScore: 88, reliabilityScore: 62, complianceStatus: "Partial", mtbf: 41, mttr: 7.4, failureModes: ["seal failure", "cavitation", "vibration anomaly"], nextAction: "Inspect suction strainer DP and seal flush plan" },
  { tag: "B203", name: "Package Boiler", type: "Boiler", location: "Boiler House", status: "Stable", riskScore: 54, reliabilityScore: 78, complianceStatus: "Ready", mtbf: 96, mttr: 5.2, failureModes: ["burner trip", "water chemistry drift"], nextAction: "Verify feedwater conductivity trend" },
  { tag: "C201", name: "Instrument Air Compressor", type: "Compressor", location: "Train 2", status: "Monitored", riskScore: 71, reliabilityScore: 69, complianceStatus: "Partial", mtbf: 58, mttr: 6.8, failureModes: ["bearing overheating", "oil contamination"], nextAction: "Review oil sample and filter collapse evidence" },
  { tag: "HX401", name: "Cooling Water Heat Exchanger", type: "Heat Exchanger", location: "Area CW-2", status: "Inspection due", riskScore: 76, reliabilityScore: 66, complianceStatus: "At Risk", mtbf: 72, mttr: 9.1, failureModes: ["corrosion under insulation", "tube leak"], nextAction: "Schedule bundle inspection and pressure test" },
  { tag: "V203", name: "Knockout Drum", type: "Pressure Vessel", location: "Area A-3", status: "Permit required", riskScore: 69, reliabilityScore: 73, complianceStatus: "Partial", mtbf: 110, mttr: 8.7, failureModes: ["pressure test overdue", "permit-to-work gap"], nextAction: "Attach API-510 inspection evidence" },
  { tag: "EP501", name: "MCC Electrical Panel", type: "Electrical Panel", location: "Bay E-4", status: "Evidence missing", riskScore: 82, reliabilityScore: 70, complianceStatus: "At Risk", mtbf: 84, mttr: 4.9, failureModes: ["arc flash label outdated", "breaker trip"], nextAction: "Update NFPA-70E evidence and energized work SOP" }
];

export const executiveMetrics = [
  { label: "Total Documents", value: "1,284", delta: "+18 this week", tone: "info" },
  { label: "Assets Indexed", value: "426", delta: "94% coverage", tone: "success" },
  { label: "Compliance Score", value: "82%", delta: "3 critical gaps", tone: "warning" },
  { label: "Critical Risks", value: "11", delta: "4 need action", tone: "critical" },
  { label: "Maintenance Alerts", value: "37", delta: "12 high severity", tone: "warning" },
  { label: "AI Queries", value: "2,918", delta: "97% cited", tone: "info" },
  { label: "Knowledge Coverage", value: "89%", delta: "+6% month over month", tone: "success" },
  { label: "Time Saved", value: "418h", delta: "$42k recovered", tone: "success" }
];

export const riskDistribution = assets.map((asset) => ({ name: asset.tag, risk: asset.riskScore, reliability: asset.reliabilityScore }));
export const downtimeTrend = [
  { month: "Jan", risk: 68, downtime: 42 },
  { month: "Feb", risk: 71, downtime: 38 },
  { month: "Mar", risk: 77, downtime: 51 },
  { month: "Apr", risk: 73, downtime: 33 },
  { month: "May", risk: 81, downtime: 48 },
  { month: "Jun", risk: 69, downtime: 28 }
];
export const alertSeverity = [
  { severity: "Critical", count: 11 },
  { severity: "High", count: 26 },
  { severity: "Medium", count: 54 },
  { severity: "Low", count: 91 }
];
export const queryBreakdown = [
  { name: "Maintenance RCA", value: 42 },
  { name: "Compliance", value: 23 },
  { name: "SOP Lookup", value: 18 },
  { name: "Inspection", value: 17 }
];
export const coverageHeatmap = [
  ["Pumps", 92, 86, 78, 94],
  ["Compressors", 84, 71, 69, 88],
  ["Boilers", 76, 82, 91, 80],
  ["Heat Exchangers", 69, 74, 66, 72],
  ["Electrical", 58, 64, 81, 61]
];

export const entities = [
  ["P101", "Equipment Tag", 96, "WO-10877_P101_vibration_repeat.pdf", "p.1 / Work Order", "P101", "Approved"],
  ["seal failure", "Failure Mode", 91, "WO-10421_mechanical_seal.pdf", "p.2 / Findings", "P101", "Approved"],
  ["cavitation", "Failure Mode", 87, "RCA-P101-draft.docx", "Section 3", "P101", "Needs Review"],
  ["NFPA-70E", "Regulatory Clause", 94, "Electrical_Safety_Checklist.xlsx", "Sheet 2", "EP501", "Approved"],
  ["pressure test overdue", "Inspection Finding", 89, "V203_API510_gap.pdf", "p.4 / Inspection", "V203", "Needs Review"],
  ["permit-to-work", "Safety Procedure", 93, "SOP-VES-203.pdf", "p.1 / Scope", "V203", "Approved"],
  ["oil contamination", "Inspection Finding", 82, "C201_oil_analysis.csv", "row 14", "C201", "Needs Review"],
  ["corrosion under insulation", "Quality Non-Conformance", 86, "HX401_inspection_report.pdf", "p.6 / NDT", "HX401", "Approved"]
] as const;

export const documents = [
  { name: "WO-10877_P101_vibration_repeat.pdf", type: "Maintenance Work Order", progress: 100, status: "Knowledge graph updated", confidence: 94 },
  { name: "SOP-MECH-014_pump_isolation.docx", type: "SOP", progress: 100, status: "Vector stored", confidence: 97 },
  { name: "HX401_inspection_report_scan.tiff", type: "Scanned Inspection", progress: 82, status: "Entity validation pending", confidence: 86 },
  { name: "Electrical_Safety_Checklist.xlsx", type: "Compliance Checklist", progress: 100, status: "NFPA mapping complete", confidence: 91 }
];

export const pipeline = ["Uploaded", "OCR", "Text Extraction", "Chunking", "Entity Extraction", "Embeddings", "Vector Storage", "Knowledge Graph"];

export const citations = [
  { title: "WO-10877_P101_vibration_repeat.pdf", page: "p.1", confidence: 92, quote: "Repeated vibration and seal failure observed. Operator reported intermittent cavitation noise and suction strainer fouling." },
  { title: "WO-10421_mechanical_seal.pdf", page: "p.2", confidence: 88, quote: "Root cause note: possible shaft misalignment after prior outage and low suction pressure causing cavitation." },
  { title: "SOP-MECH-014_pump_isolation.docx", page: "Section 4", confidence: 95, quote: "Before opening pump casing, technician must lock out stored energy, drain process fluid, verify zero pressure, and confirm seal flush isolation." }
];

export const rcaTimeline = [
  { time: "2025-08-14", event: "Mechanical seal replaced after vibration alarm ALM-VIB-HI." },
  { time: "2026-02-19", event: "Repeated seal failure; suction strainer fouling and cavitation noise reported." },
  { time: "2026-02-20", event: "Reliability engineer requested RCA and vibration trend review." },
  { time: "2026-06-18", event: "Preventive action assigned: verify alignment, flush plan, and strainer DP." }
];

export const complianceRows = [
  { standard: "Factory Act", score: 88, gap: "Machine guarding inspection evidence partial", risk: "Medium" },
  { standard: "OISD", score: 79, gap: "Permit-to-work records missing for V203 opening", risk: "High" },
  { standard: "PESO", score: 84, gap: "Pressure vessel test certificate due", risk: "High" },
  { standard: "Environmental Standards", score: 91, gap: "Cooling water discharge trend review pending", risk: "Medium" },
  { standard: "Quality Standards", score: 86, gap: "NCR closure evidence incomplete", risk: "Medium" },
  { standard: "Internal SOPs", score: 93, gap: "Two SOP revision acknowledgements pending", risk: "Low" }
];

export const lessons = [
  { title: "Repeated pump seal failures correlate with low suction pressure", detail: "P101 events show cavitation symptoms before seal replacement. Add suction strainer DP check to first-response procedure.", severity: "High" },
  { title: "Electrical compliance gaps cluster around evidence attachment", detail: "EP501 has work performed but missing NFPA-70E label evidence and energized work SOP linkage.", severity: "Critical" },
  { title: "Heat exchanger corrosion findings recur near cooling-water deposits", detail: "HX401 and HX301 reports show localized tube-sheet corrosion after deposit buildup.", severity: "High" },
  { title: "Near-miss trend: permit-to-work documentation lag", detail: "V203 and confined-space records show delayed attachment of rescue-plan evidence.", severity: "Medium" }
];

export const reports = [
  { title: "P101 Seal Failure RCA", type: "RCA Report", status: "Ready", owner: "Reliability", updated: "2026-06-18" },
  { title: "Q2 Compliance Evidence Package", type: "Audit Package", status: "Needs Review", owner: "Compliance", updated: "2026-06-20" },
  { title: "Executive Risk Summary", type: "Executive Summary", status: "Ready", owner: "Plant Manager", updated: "2026-06-21" },
  { title: "Preventive Maintenance Backlog", type: "Maintenance Report", status: "Draft", owner: "Maintenance", updated: "2026-06-19" }
];

export const navItems: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Command Dashboard", href: "/platform/dashboard", icon: Gauge },
  { label: "AI Copilot", href: "/platform/copilot", icon: Activity },
  { label: "Documents", href: "/platform/documents", icon: FileSearch },
  { label: "Knowledge Graph", href: "/platform/graph", icon: Factory },
  { label: "Entity Intelligence", href: "/platform/entities", icon: BookOpen },
  { label: "Asset 360", href: "/platform/assets", icon: Zap },
  { label: "Maintenance", href: "/platform/maintenance", icon: Wrench },
  { label: "RCA Assistant", href: "/platform/rca", icon: ClipboardCheck },
  { label: "Compliance", href: "/platform/compliance", icon: ShieldCheck },
  { label: "Lessons Learned", href: "/platform/lessons", icon: AlertTriangle },
  { label: "Reports", href: "/platform/reports", icon: BadgeCheck },
  { label: "Admin Console", href: "/platform/admin", icon: Gauge }
];
