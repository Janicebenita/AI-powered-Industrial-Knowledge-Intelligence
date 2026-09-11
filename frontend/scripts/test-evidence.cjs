const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
process.chdir(root);
if (!process.argv[2]) {
  for (const scenario of ["empty", "upload", "packaged", "corrupt"]) {
    const result = spawnSync(process.execPath, [__filename, scenario], { stdio: "inherit" });
    assert.equal(result.status, 0, scenario);
  }
  console.log("All evidence regression checks passed.");
  process.exit(0);
}
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "copilot-test-"));
process.env.COPILOT_UPLOAD_DIR = path.join(temporary, "uploads");
process.env.COPILOT_DEMO_DATA_DIR = process.argv[2] === "packaged"
  ? path.resolve(root, "../demo-data") : path.join(temporary, "missing-demo");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...rest) {
  return resolve.call(this, name.startsWith("@/") ? path.join(root, name.slice(2)) : name, ...rest);
};
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText, filename);
};
const ask = require("../app/api/copilot/ask/route.ts");
const upload = require("../app/api/documents/upload/route.ts");
const question = (text) => ask.POST(new Request("http://localhost/api/copilot/ask", {
  method: "POST", body: JSON.stringify({ question: text }),
  headers: { "Content-Type": "application/json" }
}));
const sendFile = (name, bytes, type = "text/plain") => {
  const data = new FormData();
  data.set("file", new File([bytes], name, { type }));
  return upload.POST(new Request("http://localhost/api/documents/upload", { method: "POST", body: data }));
};
function pdf(text) {
  const stream = text ? "BT /F1 12 Tf 40 150 Td (" + text + ") Tj ET" : "";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " + Buffer.byteLength(stream) + " >>\nstream\n" + stream + "\nendstream"
  ];
  let out = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(out)); out += (i + 1) + " 0 obj\n" + object + "\nendobj\n"; });
  const xref = Buffer.byteLength(out);
  out += "xref\n0 6\n0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) out += String(offset).padStart(10, "0") + " 00000 n \n";
  return Buffer.from(out + "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
}
async function run() {
  const scenario = process.argv[2];
  if (scenario === "empty") {
    assert.equal((await (await ask.GET()).json()).status, "empty");
    const answer = await (await question("Pump P101")).json();
    assert.equal(answer.confidence, 0);
    assert.equal(answer.citations.length, 0);
    assert.match(answer.direct_answer, /No searchable evidence/);
  } else if (scenario === "upload") {
    assert.equal((await sendFile("sensor-Z999.txt", "Sensor Z999 calibration interval is seventeen days.")).status, 200);
    const health = await (await ask.GET()).json();
    assert.equal(health.status, "ready");
    assert.equal(health.uploaded_documents, 1);
    const answer = await (await question("Sensor Z999 calibration interval")).json();
    assert.equal(answer.citations[0].filename, "sensor-Z999.txt");
    assert.match(answer.citations[0].quote, /seventeen days/);
    assert.equal((await sendFile("report.pdf", pdf("Sensor Y888 calibration interval is twenty days."), "application/pdf")).status, 200);
    const pdfAnswer = await (await question("Sensor Y888 twenty days")).json();
    assert.ok(pdfAnswer.citations.some((item) => item.filename === "report.pdf" && item.quote.includes("twenty days")));
    assert.equal((await sendFile("scan.pdf", pdf(""), "application/pdf")).status, 422);
    assert.equal((await sendFile("broken.pdf", "not a pdf", "application/pdf")).status, 422);
    assert.equal((await sendFile("empty.txt", "")).status, 422);
    assert.equal((await sendFile("report.docx", "binary")).status, 415);
    assert.equal((await (await upload.GET()).json()).documents.length, 2);
    const noMatch = await (await question("xylophone quasar")).json();
    assert.equal(noMatch.citations.length, 0);
    assert.match(noMatch.direct_answer, /No matching passage/);
  } else if (scenario === "packaged") {
    const health = await (await ask.GET()).json();
    assert.ok(health.demo_documents >= 16);
    for (const text of ["Why has Pump P101 failed repeatedly?", "Which assets have overdue inspections?", "What quality records are in the QA/QC manual?"]) {
      assert.ok((await (await question(text)).json()).citations.length > 0, text);
    }
  } else {
    fs.mkdirSync(process.env.COPILOT_UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(process.env.COPILOT_UPLOAD_DIR, "index.json"), "{broken");
    assert.equal((await ask.GET()).status, 500);
    assert.equal((await sendFile("valid.txt", "Calibration record")).status, 500);
    assert.equal(fs.readFileSync(path.join(process.env.COPILOT_UPLOAD_DIR, "index.json"), "utf8"), "{broken");
  }
  console.log("PASS " + scenario);
}
run().then(() => {
  const target = path.resolve(temporary);
  assert.ok(target.startsWith(path.resolve(os.tmpdir()) + path.sep));
  assert.ok(path.basename(target).startsWith("copilot-test-"));
  fs.rmSync(target, { recursive: true, force: true });
}).catch((error) => { console.error(error); process.exitCode = 1; });

