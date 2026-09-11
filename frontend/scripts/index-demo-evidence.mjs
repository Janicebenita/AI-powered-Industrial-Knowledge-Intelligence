import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";

const directory = path.resolve(process.env.COPILOT_DEMO_DATA_DIR || "../demo-data");
const documents = [];
for (const filename of (await readdir(directory)).sort()) {
  let text = "";
  const bytes = await readFile(path.join(directory, filename));
  if (/\.(txt|csv|md|log)$/i.test(filename)) {
    text = bytes.toString("utf8");
  } else if (/\.pdf$/i.test(filename)) {
    const parser = new PDFParse({ data: new Uint8Array(bytes) });
    try {
      const result = await parser.getText();
      text = result.pages.map((page) => page.text).join("\n");
    } finally {
      await parser.destroy();
    }
  }
  if (!text.trim()) continue;
  documents.push({
    filename, stored_filename: `demo-${filename}`,
    doc_type: "Demo Evidence", text: text.slice(0, 120_000)
  });
}
if (!documents.length) throw new Error("No searchable demo evidence was packaged.");
await writeFile(path.join(directory, ".copilot-index.json"), JSON.stringify(documents));
console.log(`Packaged ${documents.length} demo evidence documents.`);

