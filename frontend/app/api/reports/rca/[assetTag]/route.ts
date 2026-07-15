export const runtime = "nodejs";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\r?\n/g, " ");
}

function buildPdf(assetTag: string) {
  const title = `Industrial Brain AI - RCA Report ${assetTag}`;
  const sections = [
    "Incident Summary",
    "Pump P101 experienced repeated mechanical seal failure with high vibration and cavitation-like operating conditions.",
    "Likely Root Causes",
    "1. Low suction pressure and suction strainer fouling. 2. Seal flush instability. 3. Possible shaft misalignment after prior maintenance.",
    "Corrective Actions",
    "Inspect suction strainer DP, verify NPSH margin, restore seal flush flow, check coupling alignment, and trend vibration before restarting.",
    "Preventive Actions",
    "Add monthly suction strainer inspection, vibration trend review, seal flush verification, and RCA closeout review.",
    "Evidence Citations",
    "WO-10877_P101_vibration_repeat, WO-10421_mechanical_seal, FlowServe_P101_Manual, SOP_22_Pump_Isolation.",
    "Confidence",
    "86% - source-cited RCA draft for engineering review."
  ];
  const lines = [title, "", ...sections].map(escapePdfText);
  const contentLines = lines.map((line, index) => {
    const y = 760 - index * 22;
    const font = index === 0 ? "/F2 16 Tf" : [2, 4, 6, 8, 10].includes(index) ? "/F2 12 Tf" : "/F1 10 Tf";
    return `BT ${font} 50 ${y} Td (${line.slice(0, 92)}) Tj ET`;
  });
  const stream = contentLines.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    `6 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function POST(_request: Request, { params }: { params: Promise<{ assetTag: string }> }) {
  const { assetTag } = await params;
  const safeAssetTag = assetTag.replace(/[^\w-]+/g, "_");
  const pdf = buildPdf(safeAssetTag);

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="RCA_${safeAssetTag}.pdf"`,
      "Cache-Control": "no-store"
    }
  });
}

