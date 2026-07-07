import { NextResponse } from "next/server";

type EvidenceAnswer = {
  match: string[];
  direct_answer: string;
  confidence: number;
  evidence_strength: "strong" | "moderate" | "insufficient";
  related_assets: string[];
  related_documents: string[];
  suggested_next_actions: string[];
  citations: Array<{
    filename: string;
    page_number: number;
    section: string;
    quote: string;
    confidence: number;
  }>;
};

const evidenceAnswers: EvidenceAnswer[] = [
  {
    match: ["pump p101", "p-101", "p101", "failed repeatedly", "seal failure", "vibration"],
    direct_answer:
      "Pump P101 shows repeated seal failure and vibration anomaly patterns. Cited work-order, inspection, and OEM evidence point to low suction pressure, suction strainer fouling, cavitation, low seal flush flow, and possible shaft misalignment after prior maintenance. The first field checks should be suction strainer differential pressure, suction pressure/NPSH condition, seal flush flow, coupling alignment, and vibration trend history before replacing the seal again.",
    confidence: 0.86,
    evidence_strength: "strong",
    related_assets: ["P-101"],
    related_documents: ["WO-10877_P-101_vibration_repeat.txt", "inspection_report_P101.txt", "FlowServe_P101_Manual.txt"],
    suggested_next_actions: [
      "Verify suction strainer differential pressure and clean the strainer if fouled.",
      "Check seal flush flow and suction pressure before authorizing another seal replacement.",
      "Open RCA for repeated seal failure and compare alignment readings with vibration trend history."
    ],
    citations: [
      {
        filename: "WO-10877_P-101_vibration_repeat.txt",
        page_number: 1,
        section: "Maintenance Work Order",
        quote: "Repeated vibration and seal failure observed. Operator reported intermittent cavitation noise and suction strainer fouling.",
        confidence: 0.92
      },
      {
        filename: "inspection_report_P101.txt",
        page_number: 1,
        section: "Inspection Finding",
        quote: "Pump P101 shows repeated vibration anomaly after mechanical seal replacement. Seal flush flow was below OEM recommendation.",
        confidence: 0.9
      },
      {
        filename: "FlowServe_P101_Manual.txt",
        page_number: 1,
        section: "Troubleshooting",
        quote: "High vibration may be caused by cavitation, misalignment, bearing wear, impeller imbalance, suction restriction, or operation outside preferred range.",
        confidence: 0.94
      }
    ]
  },
  {
    match: ["maintenance history", "complete maintenance", "history of pump", "pump p101 history", "p101 maintenance"],
    direct_answer:
      "The cited maintenance history for Pump P101 shows recurring mechanical seal replacement, repeated vibration alarms, low seal flush flow, suction-side restriction, and a pending RCA action. The pattern suggests maintenance actions have treated symptoms but have not fully closed the suction restriction, cavitation, and alignment contributors.",
    confidence: 0.84,
    evidence_strength: "strong",
    related_assets: ["P-101"],
    related_documents: ["maintenance_work_orders.csv", "engineering_notes_P101.txt", "inspection_report_P101.txt"],
    suggested_next_actions: [
      "Group all P101 work orders into one repeated-failure RCA package.",
      "Confirm whether strainer cleaning and alignment verification were completed after each work order.",
      "Update preventive maintenance with monthly seal flush and suction strainer checks."
    ],
    citations: [
      {
        filename: "maintenance_work_orders.csv",
        page_number: 1,
        section: "WO-10421 / WO-10877",
        quote: "Pump P101 work orders include mechanical seal replacement, repeated vibration, and suction strainer fouling observations.",
        confidence: 0.9
      },
      {
        filename: "engineering_notes_P101.txt",
        page_number: 1,
        section: "Reliability Review",
        quote: "Engineering review notes repeated P101 seal failures and recommends suction recirculation, vibration trend review, and seal face inspection.",
        confidence: 0.86
      }
    ]
  },
  {
    match: ["sop", "before maintenance", "pump isolation", "which sop", "maintenance on pump"],
    direct_answer:
      "The recommended procedure before maintenance on Pump P101 is SOP_22_Pump_Isolation, supported by LOTO_Procedure. The cited procedure requires lockout tagout, suction and discharge valve isolation, casing drain verification, zero-pressure confirmation, and seal flush line isolation before mechanical work starts.",
    confidence: 0.91,
    evidence_strength: "strong",
    related_assets: ["P-101"],
    related_documents: ["SOP_22_Pump_Isolation.txt", "LOTO_Procedure.txt"],
    suggested_next_actions: [
      "Attach the approved isolation checklist to the P101 work pack.",
      "Require technician and supervisor sign-off before opening the pump casing.",
      "Verify zero energy and zero pressure at the job site."
    ],
    citations: [
      {
        filename: "SOP_22_Pump_Isolation.txt",
        page_number: 1,
        section: "Isolation Steps",
        quote: "Apply lockout tagout, close suction and discharge isolation valves, drain casing, verify zero pressure, and isolate seal flush line.",
        confidence: 0.96
      },
      {
        filename: "LOTO_Procedure.txt",
        page_number: 1,
        section: "Energy Isolation",
        quote: "Maintenance shall not start until all energy sources are isolated, locked, tagged, and verified by the responsible technician.",
        confidence: 0.91
      }
    ]
  },
  {
    match: ["compressor c201", "c-201", "c201", "compressor trip", "generate rca"],
    direct_answer:
      "The cited RCA draft for Compressor C201 should focus on a trip event linked to high discharge temperature, lubrication condition, and possible inlet filter restriction. The likely root-cause hypotheses are cooling performance degradation, oil contamination or inadequate lubrication, and restricted inlet airflow. Evidence is sufficient for a draft RCA, but final cause confirmation requires current vibration, oil analysis, and trip-log records.",
    confidence: 0.82,
    evidence_strength: "strong",
    related_assets: ["C-201"],
    related_documents: ["incident_C201_trip.txt", "maintenance_work_orders.csv"],
    suggested_next_actions: [
      "Collect compressor trip log, lube oil analysis, discharge temperature trend, and inlet filter differential pressure.",
      "Inspect cooler cleanliness and verify lubrication system performance.",
      "Issue corrective action for filter replacement and cooling-system cleaning if field checks confirm the hypotheses."
    ],
    citations: [
      {
        filename: "incident_C201_trip.txt",
        page_number: 1,
        section: "Incident Summary",
        quote: "Compressor C201 tripped on high discharge temperature. Operator noted abnormal noise and suspected lubrication or cooling issue.",
        confidence: 0.88
      },
      {
        filename: "maintenance_work_orders.csv",
        page_number: 1,
        section: "C201 Work Orders",
        quote: "C201 maintenance record references compressor trip investigation, inlet filter inspection, and lubrication checks.",
        confidence: 0.82
      }
    ]
  },
  {
    match: ["overdue inspection", "overdue inspections", "assets have overdue", "missing inspection"],
    direct_answer:
      "The cited compliance and inspection evidence flags Pressure Vessel V203 and Heat Exchanger HX401 as priority inspection-evidence gaps. V203 has missing or incomplete pressure vessel inspection/test evidence, while HX401 has corrosion inspection closure evidence pending. Electrical Panel EP501 also needs arc-flash or energized-work evidence for audit readiness.",
    confidence: 0.8,
    evidence_strength: "moderate",
    related_assets: ["V-203", "HX-401", "EP-501"],
    related_documents: ["OISD_Checklist.csv", "Factory_Act_Requirements.txt", "quality_issue_QA12.txt"],
    suggested_next_actions: [
      "Attach V203 pressure-test and inspection certificates.",
      "Close HX401 corrosion inspection action with repair photographs and final inspection sign-off.",
      "Upload EP501 arc-flash and energized-work control evidence."
    ],
    citations: [
      {
        filename: "OISD_Checklist.csv",
        page_number: 1,
        section: "Compliance Mapping",
        quote: "V203 pressure vessel inspection evidence missing, EP501 electrical controls missing, HX401 inspection closure partial, and P101 permit-to-work partial.",
        confidence: 0.9
      },
      {
        filename: "Factory_Act_Requirements.txt",
        page_number: 1,
        section: "Detected Gaps",
        quote: "V203 pressure test evidence missing. EP501 arc flash evidence missing. HX401 quality non-conformance QA12 remains open.",
        confidence: 0.82
      }
    ]
  },
  {
    match: ["qa/qc", "qaqc", "quality manual", "inspection and test", "quality records"],
    direct_answer:
      "The QA/QC manual evidence indicates that inspection and test controls require defined acceptance criteria, representative sampling, traceable inspection records, calibration control for measuring instruments, and documented nonconformance closure. Quality records should include inspection checklists, calibration certificates, NCRs, corrective action evidence, and final acceptance records.",
    confidence: 0.83,
    evidence_strength: "strong",
    related_assets: ["QA-12", "HX-401"],
    related_documents: ["QA_QC_Manual_Appendix_Part_2.pdf", "quality_issue_QA12.txt"],
    suggested_next_actions: [
      "Link QA/QC manual clauses to inspection records and NCR evidence.",
      "Attach calibration certificates for measuring instruments used in inspection.",
      "Close open QA12 nonconformance with corrective-action verification."
    ],
    citations: [
      {
        filename: "QA_QC_Manual_Appendix_Part_2.pdf",
        page_number: 17,
        section: "Inspection and Test Controls",
        quote: "Inspection and test activities require representative checks, defined acceptance criteria, and documented records for quality control verification.",
        confidence: 0.86
      },
      {
        filename: "quality_issue_QA12.txt",
        page_number: 1,
        section: "Non-conformance",
        quote: "Inspection non-conformance remains open. Pressure test documentation and coating repair photographs are required.",
        confidence: 0.78
      }
    ]
  },
  {
    match: ["ncr", "nonconformity", "non-conformity", "corrective action", "calibration"],
    direct_answer:
      "The NCR evidence describes a minor nonconformity where micrometers were found in use without required calibration according to the calibration schedule. The correction was recalibration and label update; the corrective action was a three-monthly calibration status check, Excel calibration schedule, revised procedure, and internal audit verification.",
    confidence: 0.9,
    evidence_strength: "strong",
    related_assets: ["QA-12"],
    related_documents: ["NCR_calibration_nonconformity.jpg", "NCR_calibration_nonconformity.txt"],
    suggested_next_actions: [
      "Verify calibration status labels before releasing inspection equipment.",
      "Add calibration schedule evidence to the audit evidence package.",
      "Check whether similar measuring tools are overdue."
    ],
    citations: [
      {
        filename: "NCR_calibration_nonconformity.txt",
        page_number: 1,
        section: "Nonconformity",
        quote: "Micrometers were found in use and had not been calibrated as required by the calibration schedule.",
        confidence: 0.92
      },
      {
        filename: "NCR_calibration_nonconformity.txt",
        page_number: 1,
        section: "Corrective Action",
        quote: "A three-monthly check requirement was added and recorded on a calibration schedule to show due-date status.",
        confidence: 0.89
      }
    ]
  },
  {
    match: ["method statement", "construction method", "road works", "construction"],
    direct_answer:
      "The method statement evidence covers construction execution controls, equipment/resources, sequence of works, inspection coordination, and QA/QC checks. It should be used as construction planning evidence, but operational decisions still require the latest approved revision, site permits, inspection test plan, and hold-point records.",
    confidence: 0.76,
    evidence_strength: "moderate",
    related_assets: ["Plant A"],
    related_documents: ["07_ConstructionMethodsStatements.pdf"],
    suggested_next_actions: [
      "Attach approved revision status and inspection test plan.",
      "Map method statement hold points to QA/QC evidence records.",
      "Confirm site permit and equipment readiness before execution."
    ],
    citations: [
      {
        filename: "07_ConstructionMethodsStatements.pdf",
        page_number: 1,
        section: "Construction Method Statement",
        quote: "The method statement describes construction sequence, resources, inspection coordination, and quality control responsibilities for the works.",
        confidence: 0.78
      }
    ]
  },
  {
    match: ["tender", "contract", "bid", "scope of work"],
    direct_answer:
      "The tender document should be treated as contractual scope evidence. For demo purposes, the indexed evidence can support questions on scope, deliverables, technical compliance, documentation requirements, and submission obligations. Final commercial interpretation should be verified against the signed contract and latest addenda.",
    confidence: 0.74,
    evidence_strength: "moderate",
    related_assets: ["Plant A"],
    related_documents: ["Tender_document.pdf"],
    suggested_next_actions: [
      "Extract scope, deliverables, eligibility, technical requirements, and document-submission clauses.",
      "Compare tender obligations against available QA/QC, method statement, and compliance evidence.",
      "Flag missing contract deliverables before final submission."
    ],
    citations: [
      {
        filename: "Tender_document.pdf",
        page_number: 1,
        section: "Tender Scope",
        quote: "Tender evidence is used to map scope, submission obligations, technical requirements, and required supporting documents.",
        confidence: 0.74
      }
    ]
  }
];

function scoreQuestion(question: string, answer: EvidenceAnswer) {
  const normalized = question.toLowerCase().replace(/[-_/]/g, " ");
  return answer.match.reduce((score, term) => {
    const normalizedTerm = term.toLowerCase().replace(/[-_/]/g, " ");
    return normalized.includes(normalizedTerm) ? score + 1 : score;
  }, 0);
}

function insufficient(question: string) {
  return {
    answer_id: crypto.randomUUID(),
    direct_answer:
      `I don't know from the available cited evidence. The question "${question}" does not match the seeded source documents strongly enough, so I will not infer an operational, safety, quality, or compliance answer without citations.`,
    confidence: 0.12,
    citations: [],
    related_assets: [],
    related_documents: [],
    suggested_next_actions: [
      "Ask with an asset tag such as P101, C201, V203, HX401, EP501, or B203.",
      "Ask about a seeded source such as QA/QC manual, NCR, tender document, method statement, SOP, work order, or inspection evidence."
    ],
    evidence_strength: "insufficient"
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question || "").trim();

  if (!question) {
    return NextResponse.json(insufficient(""), { status: 400 });
  }

  const ranked = evidenceAnswers
    .map((answer) => ({ answer, score: scoreQuestion(question, answer) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];

  if (!best || best.score === 0) {
    return NextResponse.json(insufficient(question));
  }

  return NextResponse.json({
    answer_id: crypto.randomUUID(),
    direct_answer: best.answer.direct_answer,
    confidence: best.answer.confidence,
    citations: best.answer.citations.map((citation, index) => ({
      document_id: index + 1,
      chunk_id: index + 1,
      ...citation
    })),
    related_assets: best.answer.related_assets,
    related_documents: best.answer.related_documents,
    suggested_next_actions: best.answer.suggested_next_actions,
    evidence_strength: best.answer.evidence_strength
  });
}
