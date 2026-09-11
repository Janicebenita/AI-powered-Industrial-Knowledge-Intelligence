export async function extractPdfText(bytes: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(bytes) });
  try {
    const result = await parser.getText();
    // Page separators are not evidence in an otherwise scanned/empty PDF.
    return result.pages.map((page) => page.text).join("\n").slice(0, 120_000);
  } finally {
    await parser.destroy();
  }
}

