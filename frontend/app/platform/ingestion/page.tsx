"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, RotateCcw, XCircle } from "lucide-react";
import { GlassCard, MetricCard } from "@/components/platform/cards";
import { ProcessingTimeline } from "@/components/platform/processing-timeline";
import { ConfidenceBadge, SeverityBadge } from "@/components/platform/badges";
import { documents, pipeline } from "@/lib/demo-data";

type UploadStatus = "queued" | "uploading" | "processed" | "failed";

type UploadedDocument = {
  id: string;
  name: string;
  status: UploadStatus;
  message: string;
  chunks?: number;
  entities?: number;
  docType?: string;
};

export default function IngestionPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  async function uploadOne(file: File, id: string) {
    setUploadQueue((items) =>
      items.map((item) => (item.id === id ? { ...item, status: "uploading", message: "Uploading and running ingestion pipeline..." } : item))
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("owner_role", "operations");

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Upload failed with HTTP ${response.status}`);
      }

      const result = await response.json();
      setUploadQueue((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "processed",
                message: "Processed through OCR/text extraction, chunking, entities, embeddings, and graph update.",
                chunks: result.chunks,
                entities: result.entities?.length ?? 0,
                docType: result.doc_type
              }
            : item
        )
      );
    } catch (error) {
      setUploadQueue((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "failed",
                message: error instanceof Error ? error.message : "Upload failed. Check backend server status."
              }
            : item
        )
      );
    }
  }

  function enqueueFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const nextItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      status: "queued" as const,
      message: "Queued for ingestion"
    }));

    setUploadQueue((items) => [...nextItems, ...items]);
    nextItems.forEach((item, index) => {
      const file = files[index];
      void uploadOne(file, item.id);
    });
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      enqueueFiles(event.target.files);
      event.target.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) {
      enqueueFiles(event.dataTransfer.files);
    }
  }

  const processedCount = uploadQueue.filter((item) => item.status === "processed").length;
  const failedCount = uploadQueue.filter((item) => item.status === "failed").length;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassCard>
        <h1 className="text-3xl font-black">Document Ingestion Center</h1>
        <p className="mt-2 text-slate-400">Upload PDF, DOCX, XLSX, CSV, PNG, JPG, TIFF, scanned forms, SOPs, inspection reports, and drawings.</p>
        <div
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`mt-6 grid min-h-72 place-items-center rounded-2xl border border-dashed p-6 text-center transition ${
            isDragging ? "border-cyan-300 bg-cyan-300/15 shadow-[0_0_40px_rgba(6,182,212,0.22)]" : "border-cyan-300/35 bg-cyan-300/5"
          }`}
        >
          <div>
            <FileUp className="mx-auto mb-4 text-cyan-300" size={48} />
            <p className="font-semibold">Drop industrial documents here</p>
            <p className="mt-2 text-sm text-slate-400">OCR, entity extraction, embeddings, vector storage, and graph updates start automatically.</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.tif,.tiff,.txt,.md,.log"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-xl bg-blue-500 px-5 py-3 font-bold shadow-lg shadow-blue-500/20 transition hover:bg-cyan-500"
            >
              Select files
            </button>
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-4 font-semibold">Processing Pipeline</h2>
        <ProcessingTimeline steps={pipeline} />
      </GlassCard>
      <GlassCard className="xl:col-span-2">
        <h2 className="mb-4 font-semibold">Document Queue</h2>
        {uploadQueue.length > 0 && (
          <div className="mb-5 grid gap-3 lg:grid-cols-2">
            {uploadQueue.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{doc.message}</p>
                    {doc.status === "processed" && (
                      <p className="mt-2 text-xs text-cyan-200">
                        {doc.docType} · {doc.chunks} chunks · {doc.entities} entities
                      </p>
                    )}
                  </div>
                  {doc.status === "uploading" && <Loader2 className="shrink-0 animate-spin text-cyan-300" size={22} />}
                  {doc.status === "processed" && <CheckCircle2 className="shrink-0 text-emerald-400" size={22} />}
                  {doc.status === "failed" && <XCircle className="shrink-0 text-red-400" size={22} />}
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      doc.status === "failed" ? "bg-red-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    }`}
                    style={{ width: doc.status === "queued" ? "15%" : doc.status === "uploading" ? "62%" : "100%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-3 lg:grid-cols-2">
          {documents.map((doc) => (
            <div key={doc.name} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-semibold">{doc.name}</h3><p className="text-sm text-slate-400">{doc.type}</p></div>
                <ConfidenceBadge value={doc.confidence} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${doc.progress}%` }} /></div>
              <div className="mt-3 flex items-center justify-between text-sm"><SeverityBadge value={doc.progress === 100 ? "Approved" : "Needs Review"} /><button className="inline-flex items-center gap-1 text-slate-300"><RotateCcw size={14} /> Retry</button></div>
            </div>
          ))}
        </div>
      </GlassCard>
      <MetricCard label="Uploaded This Session" value={String(processedCount)} delta="Processed through backend ingestion" tone="success" />
      <MetricCard label="Failed Uploads" value={String(failedCount)} delta="Retry after checking file type or backend logs" tone={failedCount ? "warning" : "success"} />
    </div>
  );
}
