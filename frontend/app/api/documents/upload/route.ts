import { mkdir, readFile, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ExtractedEntity = {
  name: string;
  type: string;
  confidence: number;
};

type IndexedDocument = {
  filename: string;
  stored_filename: string;
  doc_type: string;
  uploaded_at: string;
  text: string;
  entities: ExtractedEntity[];
};

const execFileAsync = promisify(execFile);
const LOCAL_PYTHON = "C:\\Users\\User\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";

const ASSET_PATTERNS = [
  ["Pump P101", /\bP-?101\b|pump/i],
  ["Compressor C201", /\bC-?201\b|compressor/i],
  ["Boiler B203", /\bB-?203\b|boiler/i],
  ["Heat Exchanger HX401", /\bHX-?401\b|heat exchanger/i],
  ["Pressure Vessel V203", /\bV-?203\b|vessel/i],
  ["Electrical Panel EP501", /\bEP-?501\b|electrical panel/i]
] as const;

function classifyDocument(filename: string, text: string) {
  const source = `${filename} ${text}`.toLowerCase();
  if (source.includes("ncr") || source.includes("nonconformity")) return "Quality Non-Conformance";
  if (source.includes("tender")) return "Tender / Contract Document";
  if (source.includes("method statement")) return "Method Statement";
  if (source.includes("qa") || source.includes("qc") || source.includes("quality")) return "QA/QC Manual";
  if (source.includes("sop") || source.includes("procedure") || source.includes("loto")) return "SOP / Safety Procedure";
  if (source.includes("inspection")) return "Inspection Report";
  if (source.includes("work order") || source.includes("maintenance")) return "Maintenance Record";
  if (source.includes("incident")) return "Incident Report";
  if (source.includes("checklist") || source.includes("factory act") || source.includes("oisd")) return "Compliance Checklist";
  if (source.includes("manual")) return "OEM Manual";
  return "Industrial Document";
}

function extractEntities(filename: string, text: string): ExtractedEntity[] {
  const source = `${filename} ${text}`;
  const entities: ExtractedEntity[] = [];

  for (const [name, pattern] of ASSET_PATTERNS) {
    if (pattern.test(source)) {
      entities.push({ name, type: "Asset", confidence: 0.92 });
    }
  }

  const signals: Array<[string, string, RegExp, number]> = [
    ["seal failure", "FailureMode", /seal failure|seal leakage/i, 0.89],
    ["vibration anomaly", "FailureMode", /vibration|vibration anomaly/i, 0.87],
    ["cavitation", "FailureMode", /cavitation/i, 0.86],
    ["corrosion under insulation", "InspectionFinding", /corrosion|cui/i, 0.84],
    ["lockout tagout", "SafetyRule", /lockout|tagout|loto/i, 0.93],
    ["permit-to-work", "Procedure", /permit[- ]to[- ]work|ptw/i, 0.9],
    ["ISO 9001", "Regulation", /iso 9001/i, 0.91],
    ["OISD", "Regulation", /oisd/i, 0.88],
    ["calibration nonconformance", "QualityIssue", /calibration|nonconformity|non-conformity/i, 0.9],
    ["pressure test overdue", "ComplianceGap", /pressure test|overdue/i, 0.82]
  ];

  for (const [name, type, pattern, confidence] of signals) {
    if (pattern.test(source)) {
      entities.push({ name, type, confidence });
    }
  }

  if (!entities.length) {
    entities.push({ name: classifyDocument(filename, text), type: "Document", confidence: 0.76 });
  }

  return entities;
}

function chunkEstimate(size: number, text: string) {
  const textChunks = Math.ceil(Math.max(text.length, 1) / 900);
  const sizeChunks = Math.ceil(Math.max(size, 1) / 120_000);
  return Math.max(1, Math.min(48, Math.max(textChunks, sizeChunks)));
}

async function extractPdfText(filePath: string) {
  const script =
    "from pypdf import PdfReader; import sys; p=sys.argv[1]; text='\\n'.join(page.extract_text() or '' for page in PdfReader(p).pages); sys.stdout.write(text[:120000])";
  const candidates = [process.env.PYTHON_PATH, LOCAL_PYTHON, "python", "py"].filter(Boolean) as string[];

  for (const python of candidates) {
    try {
      const { stdout } = await execFileAsync(python, ["-c", script, filePath], {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        maxBuffer: 1024 * 1024 * 4,
        windowsHide: true
      });
      if (stdout.trim()) return stdout.slice(0, 120_000);
    } catch {
      // Try the next Python candidate.
    }
  }

  return "";
}

async function extractText(file: File, bytes: Buffer, storedPath: string) {
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
    return (await extractPdfText(storedPath)) || `${file.name} ${file.type} ${bytes.length} bytes`;
  }

  if (file.type.startsWith("text/") || /\.(txt|csv|md|log)$/i.test(file.name)) {
    return bytes.toString("utf8").slice(0, 120_000);
  }

  return `${file.name} ${file.type} ${bytes.length} bytes`;
}

async function appendToIndex(uploadDir: string, document: IndexedDocument) {
  const indexPath = path.join(uploadDir, "index.json");
  let current: IndexedDocument[] = [];

  try {
    current = JSON.parse(await readFile(indexPath, "utf8")) as IndexedDocument[];
  } catch {
    current = [];
  }

  const next = [document, ...current.filter((item) => item.stored_filename !== document.stored_filename)].slice(0, 100);
  await writeFile(indexPath, JSON.stringify(next, null, 2), "utf8");
}

async function readIndex(uploadDir: string) {
  try {
    return JSON.parse(await readFile(path.join(uploadDir, "index.json"), "utf8")) as IndexedDocument[];
  } catch {
    return [];
  }
}

async function writeIndex(uploadDir: string, documents: IndexedDocument[]) {
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, "index.json"), JSON.stringify(documents, null, 2), "utf8");
}

export async function GET() {
  const uploadDir = path.join(process.cwd(), ".uploads", "documents");
  const documents = await readIndex(uploadDir);
  const indexedStoredNames = new Set(documents.map((document) => document.stored_filename));
  const orphanFiles: IndexedDocument[] = [];

  try {
    const files = await readdir(uploadDir);
    for (const stored_filename of files) {
      if (stored_filename === "index.json" || indexedStoredNames.has(stored_filename)) continue;

      orphanFiles.push({
        filename: stored_filename.replace(/^\d+-/, ""),
        stored_filename,
        doc_type: "Stored File - Not Indexed",
        uploaded_at: "",
        text: "",
        entities: []
      });
    }
  } catch {
    // Upload directory is optional before first upload.
  }

  return NextResponse.json({
    documents: [...documents, ...orphanFiles].map((document) => ({
      filename: document.filename,
      stored_filename: document.stored_filename,
      doc_type: document.doc_type,
      uploaded_at: document.uploaded_at,
      entities: document.entities?.length ?? 0,
      chunks: chunkEstimate(document.text.length, document.text)
    }))
  });
}

export async function DELETE(request: Request) {
  try {
    const uploadDir = path.join(process.cwd(), ".uploads", "documents");
    const storedFilename = new URL(request.url).searchParams.get("stored_filename");

    if (!storedFilename) {
      return NextResponse.json({ detail: "stored_filename is required." }, { status: 400 });
    }

    const documents = await readIndex(uploadDir);
    const target =
      documents.find((document) => document.stored_filename === storedFilename) ??
      ({
        filename: storedFilename.replace(/^\d+-/, ""),
        stored_filename: storedFilename,
        doc_type: "Stored File - Not Indexed",
        uploaded_at: "",
        text: "",
        entities: []
      } satisfies IndexedDocument);

    const storedPath = path.join(uploadDir, target.stored_filename);
    const resolvedUploadDir = path.resolve(uploadDir);
    const resolvedStoredPath = path.resolve(storedPath);

    if (!resolvedStoredPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ detail: "Invalid stored filename." }, { status: 400 });
    }

    try {
      await unlink(resolvedStoredPath);
    } catch {
      // Keep index cleanup idempotent if the file is already gone.
    }

    await writeIndex(
      uploadDir,
      documents.filter((document) => document.stored_filename !== storedFilename)
    );

    return NextResponse.json({
      status: "deleted",
      filename: target.filename,
      stored_filename: target.stored_filename
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: error instanceof Error ? error.message : "Unable to delete uploaded document."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "No file was provided for ingestion." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), ".uploads", "documents");
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
    const storedName = `${Date.now()}-${safeName}`;
    const storedPath = path.join(uploadDir, storedName);
    await writeFile(storedPath, bytes);

    const text = await extractText(file, bytes, storedPath);
    const docType = classifyDocument(file.name, text);
    const entities = extractEntities(file.name, text);
    const chunks = chunkEstimate(bytes.length, text);

    await appendToIndex(uploadDir, {
      filename: file.name,
      stored_filename: storedName,
      doc_type: docType,
      uploaded_at: new Date().toISOString(),
      text,
      entities
    });

    return NextResponse.json({
      document_id: Date.now(),
      filename: file.name,
      stored_filename: storedName,
      doc_type: docType,
      chunks,
      embeddings: chunks,
      entities,
      relationships: Math.max(entities.length - 1, 0),
      status: "processed",
      message: "Document uploaded and processed through the demo ingestion route."
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: error instanceof Error ? error.message : "Upload failed during document ingestion."
      },
      { status: 500 }
    );
  }
}
